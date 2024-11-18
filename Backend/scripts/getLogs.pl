#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use POSIX qw(strftime);

my $current_year = strftime "%Y", localtime;

# Comando para extraer datos del syslog
my $awk_command = 'zgrep  "smbd_audit: ZENTYAL-DOMAIN\\\\\\\\" /var/log/syslog* | grep "connect" | awk -F\'[ :|]\' \'{fecha = $2 " " $3 " " $4 ":" $5 ":" $6; usuario = $(NF); evento = $(NF-2); ip = $(NF-3); print fecha, usuario, evento, ip;}\'';
my @log_lines = `$awk_command`;

# Leer datos desde computers_data.txt
my %ip_to_info;
open(my $fh, '<', 'computers_data.txt') or die "No se pudo abrir el archivo: $!";
while (my $line = <$fh>) {
    chomp($line);
    my ($salon, $id_computadora, $ip) = split(' ', $line);
    $ip_to_info{$ip} = {
        salon => $salon,
        id_computadora => $id_computadora,
    };
}
close($fh);

# Procesar las líneas del log
my @user_data;

foreach my $line (@log_lines) {
    chomp($line);

    my @fields = split(' ', $line);
    my $date = sprintf("%04d %s %s %s", $current_year, $fields[0], $fields[1], $fields[2]);
    my $user = $fields[3];
    my $event = $fields[4];
    my $ip = $fields[5];

    # Obtener salón e idComputadora a partir de la IP
    my $salon = $ip_to_info{$ip}->{salon} // 'N/A';
    my $id_computadora = $ip_to_info{$ip}->{id_computadora} // 'N/A';

    push @user_data, {
        date => $date,
        user => $user,
        event => $event,
        ip => $ip,
        lab => $salon,
        id_computer => $id_computadora,
    };
}

@user_data = reverse @user_data;

my $json = JSON->new->utf8->pretty->encode(\@user_data);

print $json;
