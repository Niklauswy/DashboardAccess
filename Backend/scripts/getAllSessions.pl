#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;
use POSIX qw(strftime);

# Inicializar variables
my %sessions;  # Modified to store all session events by key
my @active_sessions;
my @completed_sessions;

# Obtener año actual para completar las fechas de log
my $now = DateTime->now(time_zone => 'local');
my $current_year = $now->year;

# Mapeo de meses para convertir nombres a números
my %month_map = (
    Jan => 1, Feb => 2, Mar => 3, Apr => 4, May => 5, Jun => 6,
    Jul => 7, Aug => 8, Sep => 9, Oct => 10, Nov => 11, Dec => 12
);

# Obtener todos los logs de conexión y desconexión
my $cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | grep -Ei "connect|disconnect" | awk \'{ match($0, /smbd_audit:[[:space:]]*(.*)/, a); split(a[1], b, /\|/); print $1, $2, $3, $4, b[5], b[3], b[2]; }\' | sort -k1M -k2n -k3';
my @lines = `$cmd`;

# First pass: collect all events for each user:ip pair
foreach my $line (@lines) {
    chomp $line;
    
    if ($line =~ /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\s+\S+\s+(\S+)\s+(\w+)\s+(\S+)/) {
        my ($month, $day, $time, $username, $event, $ip) = ($1, $2, $3, $4, $5, $6);
        
        # Parseamos la fecha
        my $month_num = $month_map{$month} || 1;
        my ($hour, $min, $sec) = split(/:/, $time);
        
        # Crear objeto DateTime
        my $log_date = eval {
            my $dt = DateTime->new(
                year   => $current_year,
                month  => $month_num,
                day    => $day,
                hour   => $hour,
                minute => $min,
                second => $sec,
                time_zone => 'local',
            );
            
            # Corregir el año si parece en el futuro
            if ($dt > $now && $dt->clone->subtract(years => 1) <= $now) {
                $dt->subtract(years => 1);
            }
            return $dt;
        };
        
        next unless $log_date; # Saltamos si hay error en la fecha
        
        # Formato de fecha para mostrar
        my $formatted_date = $log_date->strftime('%Y-%m-%d %H:%M:%S');
        my $key = "$username:$ip";
        
        # Store event with timestamp for sorting later
        push @{$sessions{$key}}, {
            username => $username,
            ip => $ip,
            time => $formatted_date,
            timestamp => $log_date->epoch,
            event => $event
        };
    }
}

# Second pass: analyze event sequences for each user:ip pair
foreach my $key (keys %sessions) {
    my @events = sort { $a->{timestamp} <=> $b->{timestamp} } @{$sessions{$key}};
    my $last_connect = undef;
    my $is_active = 0;
    
    # Process events chronologically
    foreach my $event (@events) {
        if ($event->{event} =~ /connect/i) {
            # Found a connect event
            $last_connect = $event;
            $is_active = 1; # Mark as potentially active
        } 
        elsif ($event->{event} =~ /disconnect/i && defined $last_connect) {
            # Found a disconnect event after a connect
            my $duration = $event->{timestamp} - $last_connect->{timestamp};
            
            if ($duration > 0) {
                # Create a completed session
                push @completed_sessions, {
                    username => $last_connect->{username},
                    ip => $last_connect->{ip},
                    start_time => $last_connect->{time},
                    start_timestamp => $last_connect->{timestamp},
                    end_time => $event->{time},
                    end_timestamp => $event->{timestamp},
                    duration => $duration,
                    duration_formatted => format_duration($duration),
                    status => "completed"
                };
                $last_connect = undef;
                $is_active = 0; # No longer active
            }
        }
    }
    
    # If last_connect exists and no matching disconnect was found, it's an active session
    if ($is_active && defined $last_connect) {
        my $duration = $now->epoch - $last_connect->{timestamp};
        push @active_sessions, {
            username => $last_connect->{username},
            ip => $last_connect->{ip},
            start_time => $last_connect->{time},
            start_timestamp => $last_connect->{timestamp},
            duration => $duration,
            duration_formatted => format_duration($duration),
            status => "active"
        };
    }
}

# Ordenar sesiones activas por tiempo de inicio (más recientes primero)
@active_sessions = sort { $b->{start_timestamp} <=> $a->{start_timestamp} } @active_sessions;

# Ordenar sesiones completadas por tiempo de inicio (más recientes primero)
@completed_sessions = sort { $b->{start_timestamp} <=> $a->{start_timestamp} } @completed_sessions;

# Preparar respuesta
my %response = (
    active_sessions => \@active_sessions,
    completed_sessions => \@completed_sessions
);

# Convertir a JSON
my $json = JSON->new->utf8->pretty->encode(\%response);
print $json;

# Función para formatear duración en formato legible
sub format_duration {
    my ($seconds) = @_;
    my $hours = int($seconds / 3600);
    my $minutes = int(($seconds % 3600) / 60);
    my $secs = $seconds % 60;
    
    return sprintf("%02d:%02d:%02d", $hours, $minutes, $secs);
}
