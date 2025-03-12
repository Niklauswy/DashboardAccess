#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use POSIX qw(strftime);
use DateTime;

my $current_year = strftime "%Y", localtime;

# Comando para extraer datos del syslog usando audit
#my $cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | grep -Ei "connect" | awk \'{ match($0, /smbd_audit:[[:space:]]*(.*)/, a); split(a[1], b, /\|/); print $1, $2, $3, $4, b[5], b[3], b[2]; }\' | sort -k1M -k2n -k3';
my $cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | grep -Ei "connect|disconnect" | awk \'{ match($0, /smbd_audit:[[:space:]]*(.*)/, a); split(a[1], b, /\|/); print $1, $2, $3, $4, b[5], b[3], b[2]; }\' | sort -k1M -k2n -k3 | tac';

my @log_lines = `$cmd`;

my @user_data;

foreach my $line (@log_lines) {
    chomp($line);
    my @fields = split(' ', $line);
    # Nuevo formato de salida:
    # $fields[0] = Mes, $fields[1] = Día, $fields[2] = Hora,
    # $fields[3] = usuario, $fields[4] = evento, $fields[5] = IP.
    
    # Formato de fecha estandarizado: DD/MM/YYYY HH:MM:SS
    my $month_num = month_to_num($fields[0]);
    my $day = sprintf("%02d", $fields[1]);
    my $hour = $fields[2];
    my $date = sprintf("%02d/%02d/%04d %s", $day, $month_num, $current_year, $hour);
    
    my $user = $fields[3];
    my $event = $fields[4];
    my $ip = $fields[5];

    push @user_data, {
        date  => $date,
        user  => $user,
        event => $event,
        ip    => $ip,
    };
}

# Note: The command already includes 'tac' which reverses the output
# This line might cause double-reversal of the data
@user_data = reverse @user_data;

my $json = JSON->new->utf8->pretty->encode(\@user_data);
print $json;

# Convierte nombre de mes a número
sub month_to_num {
    my ($month) = @_;
    my %months = (
        Jan => '01', Feb => '02', Mar => '03', Apr => '04',
        May => '05', Jun => '06', Jul => '07', Aug => '08', 
        Sep => '09', Oct => '10', Nov => '11', Dec => '12'
    );
    
    return $months{$month} || '01';
}