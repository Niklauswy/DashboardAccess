#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use POSIX qw(strftime);

my $current_year = strftime "%Y", localtime;

# Comando para extraer datos del syslog usando audit, sin el nombre del archivo y ordenado por fecha
my $cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | grep -Ei "connect" | awk \'{ match($0, /smbd_audit:[[:space:]]*(.*)/, a); split(a[1], b, /\|/); print $1, $2, $3, $4, b[5], b[3], b[2]; }\' | sort -k1M -k2n -k3';
my @log_lines = `$cmd`;

my @user_data;

foreach my $line (@log_lines) {
    chomp($line);
    my @fields = split(' ', $line);
    # Se espera que el comando imprima:
    # $fields[0] = Mes, $fields[1] = Día, $fields[2] = Hora, $fields[3] = usuario del syslog (ignorado),
    # $fields[4] = usuario extraído de la auditoría, $fields[5] = evento, $fields[6] = IP.
    my $date = sprintf("%04d %s %s %s", $current_year, $fields[0], $fields[1], $fields[2]);
    my $user = $fields[4];
    my $event = $fields[5];
    my $ip = $fields[6];

    push @user_data, {
        date  => $date,
        user  => $user,
        event => $event,
        ip    => $ip,
    };
}

@user_data = reverse @user_data;

my $json = JSON->new->utf8->pretty->encode(\@user_data);
print $json;