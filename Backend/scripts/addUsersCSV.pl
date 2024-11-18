#!/usr/bin/perl

use strict;
use warnings;
use EBox;
use EBox::Samba::User;
use File::Slurp;

# Definir la contraseña para todos los usuarios
my $password = 'lapassword';

# Leer el archivo CSV
my @lines = read_file('padron.csv');
chomp(@lines);

# Inicializar EBox
EBox::init();

# Obtener el contenedor predeterminado de usuarios
my $defaultContainer = EBox::Samba::User->defaultContainer();

# Función para verificar si un usuario ya existe utilizando samba-tool
sub user_exists {
    my ($username) = @_;
    my $check_command = `sudo samba-tool user show $username 2>/dev/null`;  # Redirigir errores a /dev/null
    return $check_command ? 1 : 0;  # Si hay resultado, el usuario existe
}

# Procesar cada línea del CSV
for my $line (@lines) {
    my ($username, $surname, $givenname, $stage, $ou, $groupName) = split(',', $line);

    # Verificar si el usuario ya existe
    if (user_exists($username)) {
        warn "Usuario $username ya existe. Saltando...\n";
        next;  # Saltar si el usuario ya existe
    }

    # Crear el usuario si no existe
    my $user = EBox::Samba::User->create(
        samAccountName => $username,
        parent => $defaultContainer,
        givenName => $givenname,
        sn => $surname,
        description => $stage,
        password => $password
    );

    # Solo mover el usuario si la OU está definida y no está vacía
    if (defined $ou && $ou ne '') {
        my $commandMove = "sudo samba-tool user move $username OU=$ou";
        system($commandMove) == 0 or warn "Error al mover el usuario $username a la OU $ou: $!";
    }

    # Añadir el usuario al grupo
    my $commandAddGroup = "sudo samba-tool group addmembers $groupName $username";
    system($commandAddGroup) == 0 or warn "Error al añadir el usuario $username al grupo $groupName: $!";
}

1;
