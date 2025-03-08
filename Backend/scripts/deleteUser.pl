#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use EBox;
use EBox::Global;
use EBox::Samba::User;

EBox::init();
my $samba = EBox::Global->modInstance('samba') or die "No se pudo obtener la instancia de Samba";

my $username = shift @ARGV or die "Uso: $0 <nombre_de_usuario>";
# Obtiene la lista de usuarios reales
my $users = $samba->realUsers(0) or die "No se pudieron obtener los usuarios";

my ($user) = grep { $_->get('samAccountName') eq $username } @$users;

if (!$user) {
    my $response = {
        error => "Usuario '$username' no encontrado."
    };
    print encode_json($response);
    exit 1;
}

# Elimina el usuario
eval {
    $user->deleteObject();
};

if ($@) {
    my $response = {
        error => "No se pudo eliminar el usuario '$username': $@"
    };
    print encode_json($response);
    exit 1;
} else {
    my $response = {
        success => \1,
        message => "Usuario '$username' eliminado exitosamente."
    };
    print encode_json($response);
    exit 0;
}
