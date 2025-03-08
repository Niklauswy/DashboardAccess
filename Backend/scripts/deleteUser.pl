#!/usr/bin/perl

use strict;
use warnings;
use EBox;
use EBox::Global;
use EBox::Samba::User;
use JSON;

EBox::init();
my $samba = EBox::Global->modInstance('samba') or die encode_json({ error => "No se pudo obtener la instancia de Samba" });

my $username = shift @ARGV;
if (!$username) {
    print encode_json({ error => "Nombre de usuario requerido" });
    exit 1;
}

# Obtiene la lista de usuarios reales
my $users = $samba->realUsers(0) or die encode_json({ error => "No se pudieron obtener los usuarios" });

my ($user) = grep { $_->get('samAccountName') eq $username } @$users;

if (!$user) {
    print encode_json({ error => "Usuario '$username' no encontrado" });
    exit 1;
}

# Elimina el usuario
eval {
    $user->deleteObject();
};
if ($@) {
    print encode_json({ error => "No se pudo eliminar el usuario '$username'", details => "$@" });
    exit 1;
} else {
    print encode_json({ success => 1, message => "Usuario '$username' eliminado exitosamente" });
    exit 0;
}
