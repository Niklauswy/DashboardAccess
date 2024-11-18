#!/usr/bin/perl

use strict;
use warnings;
use JSON;

use EBox;
use EBox::Samba;

EBox::init();

my $samba = EBox::Global->modInstance('samba');

my $users = $samba->users();

# Crear un hash para almacenar las OUs únicas
my %ou_data;

# Iterar sobre todos los usuarios
foreach my $user (@$users) {
    # Obtener el distinguishedName del usuario
    my $distinguishedName = $user->get('distinguishedName');

    my ($ou) = $distinguishedName =~ /OU=([^,]+)/;
    next unless $ou;  # Ignorar si no tiene OU

    # Añadir la OU al hash
    $ou_data{$ou} = 1;
}

# Convertir el hash a una lista de OUs
my @ou_list = sort keys %ou_data;


my $json = JSON->new->utf8->pretty->encode(\@ou_list);
print $json;
