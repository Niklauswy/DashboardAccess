#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use EBox;
use EBox::Samba::User;
use File::Slurp;
use Try::Tiny;
use EBox::Samba::OU; # Asegurarse que EBox::Samba::OU está disponible

# Function to print debug messages to STDERR
sub debug {
    my ($msg) = @_;
    print STDERR "[DEBUG] $msg\n";
    return;
}

EBox::init();

my $json_text = do { local $/; <STDIN> };

my $user_data;
try {
    $user_data = decode_json($json_text);
    debug("Datos JSON recibidos: " . $json_text); # Mostrar datos recibidos
} catch {
    print encode_json({ error => 'Datos JSON inválidos', details => "$_" });
    debug("Error al decodificar JSON: $_");
    exit(1);
};

# Extract user data
my $samAccountName = $user_data->{samAccountName};
my $givenName      = $user_data->{givenName};
my $sn             = $user_data->{sn};
my $password       = $user_data->{password};
my $ou             = defined $user_data->{ou} ? $user_data->{ou} : "";
my $groups         = $user_data->{groups};
my $description    = $user_data->{description} || '';

# Validar que tenemos un array de grupos
if (!$groups) {
    $groups = [];
}
elsif (ref($groups) ne 'ARRAY') {
    $groups = [$groups]; # Si no es un array, conviértelo en uno
    debug("Grupos convertidos a array: " . join(", ", @$groups));
}

# Validate required fields (OU and groups are now required)
unless ($samAccountName && $givenName && $sn && $password && $ou) {
    my $missing = [];
    push @$missing, "nombre de usuario" unless $samAccountName;
    push @$missing, "nombre" unless $givenName;
    push @$missing, "apellido" unless $sn;
    push @$missing, "contraseña" unless $password;
    push @$missing, "carrera (OU)" unless $ou;
    
    my $error_msg = "Faltan campos requeridos: " . join(", ", @$missing);
    print encode_json({ error => $error_msg });
    debug($error_msg);
    exit(1);
}

# Validate groups is a non-empty array
unless (scalar(@$groups) > 0) {
    print encode_json({ error => "Debe seleccionar al menos un grupo" });
    debug("No se seleccionaron grupos");
    exit(1);
}

# Validate password complexity with regex
if (length($password) < 8) {
    print encode_json({ error => "La contraseña debe tener al menos 8 caracteres" });
    debug("Contraseña demasiado corta");
    exit(1);
}

# Validate password complexity with regex
if ($password !~ /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/) {
    print encode_json({ 
        error => "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número"
    });
    debug("La contraseña no cumple requisitos de complejidad");
    exit(1);
}

# Get default users container and its DN string
my $defaultContainer = EBox::Samba::User->defaultContainer();
my $defaultDN = (ref $defaultContainer && $defaultContainer->can('dn'))
    ? $defaultContainer->dn
    : $defaultContainer;

debug("Default Container DN: $defaultDN");
debug("Buscando OU: $ou");

# Corregido: listar todas las OUs disponibles para comparar
my $list_ous_cmd = "sudo samba-tool ou list";
my $ous_output = qx($list_ous_cmd 2>&1);
debug("OUs disponibles: $ous_output");

# Verificar OU usando samba-tool directamente en lugar del objeto EBox
my $check_ou_cmd = "sudo samba-tool ou show \"$ou\" 2>&1";
my $ou_check = qx($check_ou_cmd);
my $ou_exists = ($? == 0);

debug("Resultado de verificación de OU: $ou_check (Existe: " . ($ou_exists ? "Sí" : "No") . ")");

if (!$ou_exists) {
    print encode_json({ error => "La carrera (OU) '$ou' no existe" });
    debug("La OU '$ou' no existe según samba-tool.");
    exit(1);
}

# Construct OU DN
my $ou_dn = "OU=$ou,$defaultDN";
debug("Usando OU DN: $ou_dn");

# Function to check if a user already exists
sub user_exists {
    my ($username) = @_;
    my $check_command = `sudo samba-tool user show "$username" 2>/dev/null`;
    return $check_command ? 1 : 0;
}

# Check if the user already exists
if (user_exists($samAccountName)) {
    print encode_json({ error => "El usuario '$samAccountName' ya existe" });
    debug("Usuario $samAccountName ya existe.");
    exit(1);
}

# Create the user
my $user;
try {
    $user = EBox::Samba::User->create(
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
    
    # Capturar errores comunes y convertirlos a mensajes más amigables
    if ($error_msg =~ /password validation failed/i) {
        $user_friendly_error = "La contraseña no cumple con los requisitos de complejidad. Debe incluir mayúsculas, minúsculas, números y caracteres especiales.";
    } elsif ($error_msg =~ /already exists/i) {
        $user_friendly_error = "El usuario '$samAccountName' ya existe en el sistema.";
    } elsif ($error_msg =~ /invalid characters/i) {
        $user_friendly_error = "El nombre de usuario contiene caracteres no válidos.";
    } else {
        $user_friendly_error = "Error al crear el usuario: $_";
    }
    
    print encode_json({ error => $user_friendly_error, details => "$error_msg" });
    debug("Error al crear el usuario: $error_msg");
    exit(1);
};

# Move the user to the specified OU
my $commandMove = "sudo samba-tool user move \"$samAccountName\" \"$ou_dn\" -d 3";
debug("Moviendo usuario $samAccountName a la OU: $ou_dn");
my $outputMove = qx($commandMove 2>&1);

if ($? != 0) {
    debug("Error al mover el usuario: $outputMove");
    print encode_json({ error => "Error al mover el usuario a la carrera (OU) especificada", details => $outputMove });
    exit(1);
} else {
    debug("Usuario $samAccountName movido exitosamente a OU $ou.");
}

# Check each group and add the user to the specified groups
debug("Procesando " . scalar(@$groups) . " grupos: " . join(", ", @$groups));
foreach my $groupName (@$groups) {
    next unless $groupName =~ /\S/;
    
    debug("Verificando existencia del grupo: $groupName");
    # Check if group exists
    my $checkGroup = `sudo samba-tool group show "$groupName" 2>/dev/null`;
    unless ($checkGroup) {
        print encode_json({ error => "El grupo '$groupName' no existe" });
        debug("El grupo '$groupName' no existe");
        exit(1);
    }
    
    debug("Añadiendo usuario $samAccountName al grupo $groupName.");
    my $commandAddGroup = "sudo samba-tool group addmembers \"$groupName\" \"$samAccountName\"";
    my $outputAddGroup = qx($commandAddGroup 2>&1);

    if ($? != 0) {
        debug("Error al añadir al grupo: $outputAddGroup");
        if ($outputAddGroup =~ /failed to find/i) {
            print encode_json({ error => "El grupo '$groupName' no existe", details => $outputAddGroup });
        } else {
            print encode_json({ error => "Error al añadir el usuario al grupo '$groupName'", details => $outputAddGroup });
        }
        exit(1);
    } else {
        debug("Usuario $samAccountName añadido exitosamente al grupo $groupName.");
    }
}

# Success response
debug("Usuario $samAccountName creado y configurado correctamente.");
print encode_json({ success => "Usuario $samAccountName creado correctamente." });





