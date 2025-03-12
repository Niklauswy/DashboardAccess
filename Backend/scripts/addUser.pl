#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use EBox;
use EBox::Global;
use EBox::Samba::User;
use File::Slurp;
use Try::Tiny;
use EBox::Samba::OU;
use EBox::Samba; # Added to access Samba module functions

# Function to print debug messages to STDERR
sub debug {
    my ($msg) = @_;
    print STDERR "[DEBUG] $msg\n";
    return;
}

EBox::init();

my $json_text = do { local $/; <STDIN> };

# Constantes y configuración
my $PASSWORD_REGEX = qr/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

# Obtener el dominio base dinámicamente
my $baseDN;
try {
    my $samba = EBox::Global->modInstance('samba');
    $baseDN = $samba->ldap()->dn();
    debug("Base DN obtenido dinámicamente: $baseDN");
} catch {
    # Si falla, usar el valor hardcodeado comao respaldo
    $baseDN = "DC=zentyal-domain,DC=lan";
    debug("Error obteniendo base DN: $_");
    debug("Usando valor por defecto: $baseDN");
};

# Función unificada para manejar errores
sub error_exit {
    my ($message, $details) = @_;
    debug($message);
    my $error_data = { error => $message };
    $error_data->{details} = $details if $details;
    print encode_json($error_data);
    exit(1);
}

# Decodificar JSON de entrada
my $user_data;
try {
    $user_data = decode_json($json_text);
} catch {
    error_exit('Datos JSON inválidos', "$_");
};

# Extraer datos del usuario
my $samAccountName = $user_data->{samAccountName} || '';
my $givenName      = $user_data->{givenName} || '';
my $sn             = $user_data->{sn} || '';
my $password       = $user_data->{password} || '';
my $ou             = $user_data->{ou} || '';
my $groups         = ref($user_data->{groups}) eq 'ARRAY' ? $user_data->{groups} : [];
my $description    = $user_data->{description} || '';

# Validar campos requeridos
my @missing;
push @missing, "nombre de usuario" unless $samAccountName;
push @missing, "nombre" unless $givenName;
push @missing, "apellido" unless $sn;
push @missing, "contraseña" unless $password;
error_exit("Faltan campos requeridos: " . join(", ", @missing)) if @missing;

# Validar grupos
error_exit("Debe seleccionar al menos un grupo") unless scalar(@$groups) > 0;

# Validar contraseña
error_exit("La contraseña debe tener al menos 8 caracteres") if length($password) < 8;
error_exit("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número") 
    unless $password =~ $PASSWORD_REGEX;

# Verificar si el usuario ya existe
my $user_exists = `sudo samba-tool user show "$samAccountName" 2>/dev/null`;
error_exit("El usuario '$samAccountName' ya existe") if $user_exists;

# Obtener contenedor predeterminado
my $defaultContainer = EBox::Samba::User->defaultContainer();

# Crear el usuario
try {
    my $user = EBox::Samba::User->create(
        samAccountName => $samAccountName,
        parent         => $defaultContainer,
        givenName      => $givenName,
        sn             => $sn,
        description    => $description,
        password       => $password
    );
    debug("Usuario $samAccountName creado exitosamente.");
} catch {
    my $error_msg = $_;
    my $user_friendly_error;
    
    if ($error_msg =~ /password validation failed/i) {
        $user_friendly_error = "La contraseña no cumple con los requisitos de complejidad.";
    } elsif ($error_msg =~ /already exists/i) {
        $user_friendly_error = "El usuario '$samAccountName' ya existe en el sistema.";
    } elsif ($error_msg =~ /invalid characters/i) {
        $user_friendly_error = "El nombre de usuario contiene caracteres no válidos.";
    } else {
        $user_friendly_error = "Error al crear el usuario: $_";
    }
    
    error_exit($user_friendly_error, "$error_msg");
};

# Mover a OU si se especificó
if ($ou) {
    # Simplificamos la validación de OU
    my $list_ous_cmd = "sudo samba-tool ou list";
    my @available_ous = split(/\n/, qx($list_ous_cmd));
    my $ou_exists = 0;
    
    foreach my $available_ou (@available_ous) {
        $available_ou =~ s/^\s+|\s+$//g;  # trim
        $available_ou =~ s/^OU=//i;       # remove prefix
        if (lc($available_ou) eq lc($ou)) {
            $ou_exists = 1;
            $ou = $available_ou;  # usar el caso exacto
            last;
        }
    }
    
    error_exit("La carrera (OU) '$ou' no existe") unless $ou_exists;
    
    # Cambiamos la construcción del DN para que coincida con el formato esperado
    my $ou_dn = "OU=$ou,$baseDN";
    debug("Intentando mover usuario a: $ou_dn");
    
    my $commandMove = "sudo samba-tool user move \"$samAccountName\" \"$ou_dn\"";
    debug("Ejecutando comando: $commandMove");
    my $outputMove = qx($commandMove 2>&1);

    error_exit("Error al mover el usuario a la OU especificada", $outputMove) if $? != 0;
    debug("Usuario $samAccountName movido exitosamente a OU $ou.");
}

# Agregar a grupos
foreach my $groupName (@$groups) {
    next unless $groupName =~ /\S/;
    
    my $checkGroup = `sudo samba-tool group show "$groupName" 2>/dev/null`;
    error_exit("El grupo '$groupName' no existe") unless $checkGroup;
    
    my $commandAddGroup = "sudo samba-tool group addmembers \"$groupName\" \"$samAccountName\"";
    my $outputAddGroup = qx($commandAddGroup 2>&1);

    if ($? != 0) {
        error_exit("Error al añadir el usuario al grupo '$groupName'", $outputAddGroup);
    }
    debug("Usuario $samAccountName añadido exitosamente al grupo $groupName.");
}

# Respuesta exitosa
print encode_json({ success => "Usuario $samAccountName creado correctamente." });
exit(0);





