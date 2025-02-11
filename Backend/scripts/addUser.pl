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
    print encode_json({ error => 'Datos JSON inválidos' });
    debug("Error al decodificar JSON: $_");
    exit(1);
};

# Extract user data
my $samAccountName = $user_data->{samAccountName};
my $givenName      = $user_data->{givenName};
my $sn             = $user_data->{sn};
my $password       = $user_data->{password};
my $ou             = $user_data->{ou};
my $groups         = $user_data->{groups};
my $description    = $user_data->{description} || '';

# Validate required fields
unless ($samAccountName && $givenName && $sn && $password && $ou && $groups) {
    print encode_json({ error => 'Faltan campos requeridos' });
    debug("Faltan campos requeridos en el JSON.");
    exit(1);
}

# Get default users container and its DN string
my $defaultContainer = EBox::Samba::User->defaultContainer();
my $defaultDN = (ref $defaultContainer && $defaultContainer->can('dn'))
    ? $defaultContainer->dn
    : $defaultContainer;

# Function to check if a user already exists
sub user_exists {
    my ($username) = @_;
    my $check_command = `sudo samba-tool user show "$username" 2>/dev/null`;
    return $check_command ? 1 : 0;
}

# Check if the user already exists
if (user_exists($samAccountName)) {
    print encode_json({ error => "Usuario $samAccountName ya existe. Saltando..." });
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
    print encode_json({ error => "Error al crear el usuario: $_" });
    debug("Error al crear el usuario: $_");
    exit(1);
};

# Move the user to the specified OU if defined and valid, otherwise use default container
if (not defined $ou || $ou eq '') {
    $ou = $defaultDN;
} else {
    my $ou_dn = "ou=$ou," . $defaultDN;  # construct expected DN for the OU
    my $ou_obj = EBox::Samba::OU->new( dn => $ou_dn );
    if (not $ou_obj->exists()) {   # using existing exists() method
        debug("La OU '$ou' no existe. Usando contenedor por defecto.");
        $ou = $defaultDN;
    } else {
        $ou = $ou_obj->dn;
    }
}

if ($ou ne $defaultDN) {
    my $commandMove = "sudo samba-tool user move \"$samAccountName\" \"$ou\" -d 3";
    debug("Moviendo usuario $samAccountName a la OU: $ou");
    my $outputMove = qx($commandMove 2>&1);

    if ($? != 0) {
        debug("Error al mover el usuario: $outputMove");
        if ($outputMove =~ /parent does not exist/i) {
            print STDERR encode_json({ error => "El contenedor/OU '$ou' no existe." }), "\n";
        } else {
            print STDERR encode_json({ error => "Error al mover el usuario $samAccountName a la OU $ou: $outputMove" }), "\n";
        }
        exit(1);
    } else {
        debug("Usuario $samAccountName movido exitosamente a OU $ou.");
    }
}

# Add the user to the specified groups
foreach my $groupName (@$groups) {
    debug("Añadiendo usuario $samAccountName al grupo $groupName.");
    my $commandAddGroup = "sudo samba-tool group addmembers \"$groupName\" \"$samAccountName\"";
    my $outputAddGroup = qx($commandAddGroup 2>&1);

    if ($? != 0) {
        debug("Error al añadir al grupo: $outputAddGroup");
        print encode_json({ error => "Error al añadir el usuario $samAccountName al grupo $groupName: $outputAddGroup" });
        exit(1);
    } else {
        debug("Usuario $samAccountName añadido exitosamente al grupo $groupName.");
    }
}

# Success response
debug("Usuario $samAccountName creado y configurado correctamente.");
print encode_json({ success => "Usuario $samAccountName creado correctamente." });





