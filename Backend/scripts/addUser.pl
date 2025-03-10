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
    #debug("Datos JSON decodificados correctamente.");
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

# Validate required fields (OU and groups are now required)
unless ($samAccountName && $givenName && $sn && $password) {
    my $missing = [];
    push @$missing, "nombre de usuario" unless $samAccountName;
    push @$missing, "nombre" unless $givenName;
    push @$missing, "apellido" unless $sn;
    push @$missing, "contraseña" unless $password;
    
    my $error_msg = "Faltan campos requeridos: " . join(", ", @$missing);
    print encode_json({ error => $error_msg });
    debug($error_msg);
    exit(1);
}

# Validate groups is a non-empty array
unless ($groups && ref($groups) eq 'ARRAY' && scalar(@$groups) > 0) {
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

# SIMPLIFICADO: Hardcodear el dominio directamente
my $domain_components = "dc=access,dc=com";
debug("Usando dominio hardcodeado: $domain_components");

# Verificar OU solo si se proporciona
my $move_user = 0;  # Por defecto, no mover
my $ou_dn = "";     # Inicializar vacío

if ($ou) {
    debug("Buscando OU: $ou");
    
    # Validar que la OU existe
    my $list_ous_cmd = "sudo samba-tool ou list";
    my @available_ous_raw = split(/\n/, qx($list_ous_cmd));
    
    # Procesar y limpiar lista de OUs
    my @available_ous = ();
    foreach my $raw_ou (@available_ous_raw) {
        $raw_ou =~ s/^\s+|\s+$//g;  # trim whitespace
        $raw_ou =~ s/^OU=//i;       # Remove "OU=" prefix if present
        push @available_ous, $raw_ou if $raw_ou;
    }
    
    debug("OUs disponibles: " . join(", ", @available_ous));
    
    # Verificar si la OU existe (con verificación insensible a mayúsculas/minúsculas)
    my $ou_exists = 0;
    foreach my $available_ou (@available_ous) {
        if (lc($available_ou) eq lc($ou)) {
            $ou_exists = 1;
            debug("OU encontrada: $ou");
            # Usar el nombre exacto de la lista para mantener la consistencia
            $ou = $available_ou;
            last;
        }
    }
    
    if (!$ou_exists) {
        print encode_json({ error => "La carrera (OU) '$ou' no existe" });
        debug("La OU '$ou' no existe.");
        exit(1);
    }
    
    # Construir el DN para la OU
    $ou_dn = "ou=$ou,$domain_components";
    debug("Usando OU DN: $ou_dn");
    $move_user = 1;  # Habilitar mover el usuario
}

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

# Mover el usuario a la OU solamente si se proporcionó una OU
if ($move_user && $ou_dn) {
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
} else {
    debug("No se especificó OU o el OU_DN está vacío. El usuario $samAccountName permanece en el contenedor por defecto.");
}

# Check each group and add the user to the specified groups
foreach my $groupName (@$groups) {
    next unless $groupName =~ /\S/;
    
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





