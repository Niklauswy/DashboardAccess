#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;
use POSIX qw(strftime);

# Debug function
sub debug {
    my ($msg) = @_;
    print STDERR "[DEBUG] $msg\n";
}

debug("Script started");

# Inicializar variables
my %sessions;  # Modified to store all session events by key
my @active_sessions;
my @completed_sessions;

# Obtener año actual para completar las fechas de log
my $now = DateTime->now(time_zone => 'local');
my $current_year = $now->year;
debug("Current year: $current_year");

# Mapeo de meses para convertir nombres a números
my %month_map = (
    Jan => 1, Feb => 2, Mar => 3, Apr => 4, May => 5, Jun => 6,
    Jul => 7, Aug => 8, Sep => 9, Oct => 10, Nov => 11, Dec => 12
);

# Update the command to search for smbd_audit connect/disconnect entries
my $cmd = q(zgrep -a "smbd_audit:" /var/log/syslog* | grep -Ei "connect|disconnect");
debug("Executing command: $cmd");

my @log_lines = `$cmd`;
debug("Found " . scalar(@log_lines) . " log lines");

if (scalar(@log_lines) == 0) {
    debug("No log lines found. Trying different command...");
    $cmd = q(grep -a "smbd_audit:" /var/log/syslog | grep -Ei "connect|disconnect");
    debug("Executing alternative command: $cmd");
    @log_lines = `$cmd`;
    debug("Found " . scalar(@log_lines) . " log lines with alternative command");
}

# For debugging, show first few log lines
my $sample_size = scalar(@log_lines) > 5 ? 5 : scalar(@log_lines);
for (my $i = 0; $i < $sample_size; $i++) {
    debug("Sample log line $i: " . $log_lines[$i]);
}

# Process only if we have log lines
if (scalar(@log_lines) > 0) {
    debug("Processing log lines...");
    foreach my $line (@log_lines) {
        chomp($line);
        debug("Processing line: $line");
        
        # Match standard syslog format with smbd_audit entries
        if ($line =~ /^(\w+)\s+(\d+)\s+(\d+:\d+:\d+).*?smbd_audit:\s+(.*)$/) {
            my $month = $1;
            my $day = $2;
            my $time = $3;
            my $audit_msg = $4;
            
            debug("Matched line: Month=$month, Day=$day, Time=$time, Message=$audit_msg");
            
            # Improved regex pattern for Samba audit messages
            # Format: DOMAIN\Username|IP|event|status|Username
            if ($audit_msg =~ /([^\\]+)\\([^|]+)\|([^|]+)\|(connect|disconnect)\|([^|]+)(?:\|([^|]+))?/) {
                my $domain = $1;
                my $domainUser = $2;
                my $ip = $3;
                my $event = $4;  # connect or disconnect
                my $status = $5;
                my $username = $6 || $domainUser;  # Use the last field if available, otherwise use domain user
                
                debug("Extracted: Domain=$domain, User=$domainUser, IP=$ip, Event=$event, Status=$status, Username=$username");
                
                # Process into session data
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
                
                if ($log_date) {
                    my $formatted_date = $log_date->strftime('%Y-%m-%d %H:%M:%S');
                    my $key = "$domainUser:$ip"; # Use domainUser for consistency
                    debug("Adding event: $key at $formatted_date (event: $event)");
                    
                    # Store event with timestamp for sorting later
                    push @{$sessions{$key}}, {
                        username => $domainUser, # Use domainUser consistently
                        ip => $ip,
                        time => $formatted_date,
                        timestamp => $log_date->epoch,
                        event => $event
                    };
                } else {
                    debug("Failed to create date object");
                }
            } else {
                debug("Failed to extract username and IP from audit message: '$audit_msg'");
            }
        } else {
            debug("Line did not match expected format");
        }
    }
    
    debug("Processing collected sessions. Found " . scalar(keys %sessions) . " unique user:ip combinations");
    
    # Second pass: analyze event sequences for each user:ip pair
    foreach my $key (keys %sessions) {
        debug("Processing events for $key");
        
        # Sort events chronologically
        my @events = sort { $a->{timestamp} <=> $b->{timestamp} } @{$sessions{$key}};
        my $last_connect = undef;
        my $is_active = 0;
        
        debug("Found " . scalar(@events) . " events for $key");
        
        # Process events chronologically
        foreach my $event (@events) {
            debug("Processing event: $event->{event} at $event->{time}");
            
            if ($event->{event} eq "connect") {
                # Found a connect event - start of a session
                $last_connect = $event;
                $is_active = 1;
                debug("Found connect event at " . $event->{time});
            } 
            elsif ($event->{event} eq "disconnect" && defined $last_connect) {
                # Found disconnect after connect - completed session
                my $duration = $event->{timestamp} - $last_connect->{timestamp};
                debug("Found disconnect event at " . $event->{time} . ". Session duration: $duration seconds");
                
                if ($duration >= 0) {  # Accept zero duration for quick sessions
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
                    debug("Added completed session for $last_connect->{username} from $last_connect->{time} to $event->{time}");
                } else {
                    debug("Invalid session duration: $duration - ignoring");
                }
                
                # Reset for new session
                $last_connect = undef;
                $is_active = 0;
            }
        }
        
        # Only consider it an active session if:
        # 1. The last event we saw was a connect ($is_active is true)
        # 2. We have a valid last_connect event
        if ($is_active && defined $last_connect) {
            my $duration = $now->epoch - $last_connect->{timestamp};
            debug("Found active session for $last_connect->{username} from $last_connect->{time}. Duration so far: $duration seconds");
            
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
}

debug("Active sessions: " . scalar(@active_sessions));
debug("Completed sessions: " . scalar(@completed_sessions));

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
debug("Returning JSON response");
print $json;

# Función para formatear duración en formato legible
sub format_duration {
    my ($seconds) = @_;
    my $hours = int($seconds / 3600);
    my $minutes = int(($seconds % 3600) / 60);
    my $secs = $seconds % 60;
    
    return sprintf("%02d:%02d:%02d", $hours, $minutes, $secs);
}
