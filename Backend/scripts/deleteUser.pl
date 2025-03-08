#!/usr/bin/perl

use strict;
use warnings;
use EBox;
use EBox::Global;
use EBox::Samba::User;

EBox::init();
my $samba = EBox::Global->modInstance('samba') or die "No se pudo obtener la instancia de Samba";

my $username = shift @ARGV or die "Uso: $0 <nombre_de_usuario>";
# Obtiene la lista de usuarios reales
my $users = $samba->realUsers(0) or die "No se pudieron obtener los usuarios";

my ($user) = grep { $_->get('samAccountName') eq $username } @$users;

die "Usuario '$username' no encontrado.\n" unless $user;

# Elimina el usuario
eval {
    $user->deleteObject();
};
if ($@) {
    die "No se pudo eliminar el usuario '$username': $@\n";
} else {
    print "Usuario '$username' eliminado exitosamente.\n";
}
