#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;

use EBox;
use EBox::Samba;

# Inicializa EBox y obtiene la instancia de Samba
EBox::init();
my $samba = EBox::Global->modInstance('samba') or die "No se pudo obtener la instancia de Samba";

my $users = $samba->realUsers(0) or die "No se pudieron obtener los usuarios";
my @user_data = map { format_user($_) } @$users;

# Convierte los datos a JSON y los imprime
my $json = JSON->new->utf8->pretty->encode(\@user_data);
print $json;

# Función para formatear datos de un usuario
sub format_user {
    my ($user) = @_;

    my $username = $user->get('samAccountName') // 'Unknown';
    my $distinguishedName = $user->get('distinguishedName') // 'Unknown';
    my ($ou) = $distinguishedName =~ /OU=([^,]+)/;
    $ou = $ou // 'Desconocido';

    my @groups = map { /CN=([^,]+)/ ? $1 : 'Unknown' } $user->get('memberOf');

    my $lastLogon = $user->get('lastLogon') // 0;
    my $logonCount = $user->get('logonCount') // 0;

    my $lastLogonDate = convert_epoch($lastLogon);

    return {
        username   => $username,
        name       => $user->get('displayName') // 'Unknown',
        logonCount => int($logonCount),
        ou         => $ou,
        groups     => \@groups,
        lastLogon  => $lastLogonDate,
    };
}

sub convert_epoch {
    my ($lastLogon) = @_;
    my $epoch = ($lastLogon / 10000000) - 11644473600;
    my $dt = DateTime->from_epoch(epoch => $epoch, time_zone => 'local');
    return $dt->strftime('%d/%m/%Y %H:%M:%S');
}
