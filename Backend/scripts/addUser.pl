#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use EBox;
use EBox::Samba::User;
use File::Slurp;
use Try::Tiny;

# Function to print debug messages to STDERR
sub debug {
    my ($msg) = @_;
    # print STDERR "$msg\n";  # Descomentar si necesitas debug
    return;
}

# Initialize EBox
EBox::init();

# Read JSON data from stdin
my $json_text = do { local $/; <STDIN> };

my $user_data;
try {
    $user_data = decode_json($json_text);
} catch {
    print encode_json({ error => 'Datos JSON inválidos' });
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
    exit(1);
}

# Get default users container
my $defaultContainer = EBox::Samba::User->defaultContainer();

# Function to check if a user already exists
sub user_exists {
    my ($username) = @_;
    my $check_command = `sudo samba-tool user show "$username" 2>/dev/null`;
    return $check_command ? 1 : 0;
}

# Check if the user already exists
if (user_exists($samAccountName)) {
    print encode_json({ error => "Usuario $samAccountName ya existe. Saltando..." });
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
} catch {
    print encode_json({ error => "Error al crear el usuario: $_" });
    exit(1);
};

# Move the user to the specified OU if defined and not empty
if (defined $ou && $ou ne '') {
    my $commandMove = "sudo samba-tool user move \"$samAccountName\" \"OU=$ou\"";
    my $outputMove = qx($commandMove 2>&1);  # Captura stdout y stderr

    if ($? != 0) {  # Si hubo un error
        # Verifica si el error menciona "parent does not exist"
        if ($outputMove =~ /parent does not exist/i) {
            print encode_json({ error => "El contenedor/OU '$ou' no existe." });
        } else {
            # Si es otro tipo de error, muestra el mensaje original
            print encode_json({ error => "Error al mover el usuario $samAccountName a la OU $ou: $outputMove" });
        }
        exit(1);
    }
}

# Add the user to the specified groups
foreach my $groupName (@$groups) {
    my $commandAddGroup = "sudo samba-tool group addmembers \"$groupName\" \"$samAccountName\"";
    my $outputAddGroup = qx($commandAddGroup 2>&1);
    if ($? != 0) {
        print encode_json({ error => "Error al añadir el usuario $samAccountName al grupo $groupName: $outputAddGroup" });
        exit(1);
    }
}

# Success response
print encode_json({ success => "Usuario $samAccountName creado correctamente." });
