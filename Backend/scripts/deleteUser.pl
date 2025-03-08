#!/usr/bin/perl

use strict;
use warnings;
use EBox;
use EBox::Global;
use EBox::Samba::User;
use JSON;
use Encode qw(decode);

# Sanitize input to prevent potential security issues
sub sanitize_input {
    my $input = shift;
    $input =~ s/[;&|`$()<>'"]//g;  # Remove potentially dangerous characters
    return $input;
}

EBox::init();

# Get and validate username
my $username = shift @ARGV;
if (!$username) {
    print encode_json({ error => "Nombre de usuario requerido" });
    exit 1;
}

# Sanitize input
$username = sanitize_input($username);

eval {
    my $samba = EBox::Global->modInstance('samba');
    if (!$samba) {
        die "No se pudo obtener la instancia de Samba";
    }

    my $users = $samba->realUsers(0);
    if (!$users) {
        die "No se pudieron obtener los usuarios";
    }

    my ($user) = grep { $_->get('samAccountName') eq $username } @$users;
    
    if (!$user) {
        die "Usuario '$username' no encontrado";
    }

    # Elimina el usuario
    $user->deleteObject();
    
    print encode_json({ success => 1, message => "Usuario '$username' eliminado exitosamente" });
};

if ($@) {
    print encode_json({ error => "No se pudo eliminar el usuario '$username'", details => "$@" });
    exit 1;
}

exit 0;
