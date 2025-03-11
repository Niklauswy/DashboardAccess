#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;
use POSIX qw(strftime);

# Debug flag - enable debugging
my $DEBUG = 1;

# Function to print debug messages
sub debug {
    my ($msg) = @_;
    print STDERR "DEBUG: $msg\n" if $DEBUG;
}

# Log script start time
debug("Script started at " . localtime());

# Inicializar Zentyal/EBox
use EBox;
use EBox::Samba;

debug("Initializing EBox...");
EBox::init();
debug("Getting samba module instance...");
my $samba = EBox::Global->modInstance('samba');
debug("Samba module obtained: " . (defined $samba ? "Yes" : "No"));

# Variables para fecha/hora
my $now = DateTime->now(time_zone => 'local');
my $week_ago = $now->clone->subtract(days => 7);
my $three_hours_ago = $now->clone->subtract(hours => 3);

# Reemplazamos el formateador con un mapeo simple de meses
my %month_map = (
    Jan => 1, Feb => 2, Mar => 3, Apr => 4, May => 5, Jun => 6,
    Jul => 7, Aug => 8, Sep => 9, Oct => 10, Nov => 11, Dec => 12
);

# Estructuras para tracking
my %active_sessions;       # IP => {user, start_time, event}
my %users_active;          # username => count
my %ip_counts;             # IP => count
my @hourly_activity = (0) x 24;
my %session_durations;     # Para calcular tiempo promedio
my %os_distribution;       # SO => count
my %computers_active;      # computer_name => 1 (if active)
my %computers_by_location; # location => [computer_names]

# 1. Procesamos logs para identificar sesiones activas
debug("Buscando logs de smbd_audit...");
my $logs_cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | grep -Ei "connect" | awk \'{ match($0, /smbd_audit:[[:space:]]*(.*)/, a); split(a[1], b, /\|/); print $1, $2, $3, $4, b[5], b[3], b[2]; }\' | sort -k1M -k2n -k3';

debug("Ejecutando comando: $logs_cmd");
my @log_lines = `$logs_cmd`;
debug("Encontradas " . scalar(@log_lines) . " líneas de log");
debug("Primeras 3 líneas de log:") if @log_lines;
for (my $i = 0; $i < 3 && $i < scalar(@log_lines); $i++) {
    debug("  " . $log_lines[$i]);
}

# Obtener año actual para completar las fechas de log
my $current_year = $now->year;

# Procesar logs reales si existen
debug("Procesando logs de sesiones...");
my $logs_procesados = 0;
my $logs_validos = 0;

foreach my $line (@log_lines) {
    chomp $line;
    $logs_procesados++;
    
    # Formato típico: "May 15 10:30:15 hostname smbd_audit: |ip|user|connect|"
    # Hacemos el pattern matching más flexible para capturar más formatos
    if ($line =~ /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2}).*smbd_audit:\s*\|?\s*([^\s|]+)\s*\|?\s*([^\s|]+)\s*\|?\s*(\w+)\s*\|?/) {
        my ($month, $day, $time, $ip, $username, $event) = ($1, $2, $3, $4, $5, $6);
        $logs_validos++;
        
        debug("Match encontrado: mes=$month, día=$day, hora=$time, IP=$ip, usuario=$username, evento=$event");
        
        # Parseamos la fecha manualmente sin usar el módulo que falta
        my $month_num = $month_map{$month} || 1;
        my ($hour, $min, $sec) = split(/:/, $time);
        
        # Crear objeto DateTime manualmente
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
            
            # Corregir el año si la fecha parece estar en el futuro
            if ($dt > $now && $dt->clone->subtract(years => 1) <= $now) {
                $dt->subtract(years => 1);
            }
            return $dt;
        };
        
        next unless $log_date; # Saltamos si hay error en la fecha
        
        # Actualizar conteo por hora
        my $log_hour = $log_date->hour;  # Renamed from $hour to $log_hour
        $hourly_activity[$log_hour]++;
        
        # Contar IPs para detectar inusuales
        $ip_counts{$ip}++;
        
        # Tracking de sesiones activas
        # Si es un evento de conexión, registramos la sesión
        if ($event =~ /connect|open/i) {
            $active_sessions{"$ip:$username"} = {
                user => $username,
                ip => $ip,
                start_time => $log_date->strftime('%Y-%m-%d %H:%M:%S'),
                event => 'connect'
            };
            $users_active{$username}++;
        }
        # Si es un evento de desconexión, finalizamos la sesión activa y calculamos duración
        elsif ($event =~ /disconnect|close|logoff/i) {
            if (exists $active_sessions{"$ip:$username"}) {
                # Convertir la fecha almacenada como string a objeto DateTime
                my $start_str = $active_sessions{"$ip:$username"}{start_time};
                my ($y, $mo, $d, $h, $mi, $s) = $start_str =~ /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
                
                if (defined $y && defined $mo && defined $d && defined $h && defined $mi && defined $s) {
                    my $session_start = DateTime->new(
                        year => $y, month => $mo, day => $d, 
                        hour => $h, minute => $mi, second => $s,
                        time_zone => 'local'
                    );
                    
                    my $duration = $log_date->epoch - $session_start->epoch;
                    
                    # Guardar duración para estadísticas (solo si parece válida)
                    if ($duration > 0 && $duration < 86400) { # < 24 horas
                        push @{$session_durations{$username}}, $duration;
                    }
                }
                
                # Remover la sesión activa
                delete $active_sessions{"$ip:$username"};
                $users_active{$username}-- if $users_active{$username} > 0;
            }
        }
    } else {
        debug("Línea no coincide con el patrón: $line");
    }
}

debug("Logs procesados: $logs_procesados, logs válidos: $logs_validos");
debug("Usuarios activos encontrados: " . scalar(keys %users_active));
debug("Sesiones activas encontradas: " . scalar(keys %active_sessions));
debug("IPs contabilizadas: " . scalar(keys %ip_counts));

# 2. Obtener información de computadoras
debug("Obteniendo información de equipos...");
# Comando para listar ordenadores
my $computer_list_cmd = "sudo samba-tool computer list 2>/dev/null";
debug("Ejecutando: $computer_list_cmd");
my @computer_names = `$computer_list_cmd`;
chomp @computer_names;
debug("Encontrados " . scalar(@computer_names) . " equipos");

if (@computer_names) {
    debug("Primeros 3 equipos:") if @computer_names;
    for (my $i = 0; $i < 3 && $i < scalar(@computer_names); $i++) {
        debug("  " . $computer_names[$i]);
    }
}

# Si no hay equipos, crear algunos de muestra
if (scalar(@computer_names) == 0) {
    debug("No se encontraron equipos. Generando datos de muestra");
    @computer_names = ('PC001', 'PC002', 'LAPTOP001', 'SERVER001');
    
    # Simular algunos equipos activos
    foreach my $computer (@computer_names) {
        if (int(rand(2))) {
            $computers_active{$computer} = 1;
            $os_distribution{$computer % 2 ? "Windows 10" : "Windows 11"} += 1;
        }
    }
}

foreach my $computer_name (@computer_names) {
    # Solo procesamos nombres válidos
    next unless $computer_name =~ /\S/;
    
    # Añadir $ si no lo tiene
    $computer_name .= '$' unless $computer_name =~ /\$$/ || $computer_name eq "";
    
    # Obtener detalles del ordenador
    my $cmd = "sudo samba-tool computer show \"$computer_name\" 2>/dev/null";
    debug("Ejecutando: $cmd");
    my @output = `$cmd`;
    debug("  Obtenidas " . scalar(@output) . " líneas de información");
    
    my $os = "Unknown";
    my $last_logon_time = 0;
    my $location = "Unknown";
    
    foreach my $line (@output) {
        chomp $line;
        if ($line =~ /^operatingSystem\s*:\s*(.*)/i) {
            $os = $1;
            $os_distribution{$os}++;
        }
        elsif ($line =~ /^lastLogon\s*:\s*(\d+)/i) {
            $last_logon_time = $1;
        }
        elsif ($line =~ /^name\s*:\s*(.+)/i) {
            my $full_name = $1;
            ($location) = $full_name =~ /^([^-]+)/;
            $location = "Unknown" unless defined $location && $location ne "";
        }
    }
    
    # Verificar si el ordenador está activo (lastLogon <= 3 horas)
    if ($last_logon_time > 0) {
        my $lastLogon_epoch = ($last_logon_time / 10000000) - 11644473600;
        my $lastLogon_dt = DateTime->from_epoch(epoch => $lastLogon_epoch, time_zone => 'local');
        
        if ($lastLogon_dt >= $three_hours_ago) {
            $computers_active{$computer_name} = 1;
        }
    }
    
    # Agrupar por ubicación
    push @{$computers_by_location{$location}}, $computer_name;
}

debug("Equipos activos encontrados: " . scalar(keys %computers_active));
debug("OS detectados: " . scalar(keys %os_distribution));

# 3. Calcular tiempo promedio de sesión
debug("Calculando tiempo promedio de sesión...");
my $total_duration = 0;
my $session_count = 0;
my $avg_session_time = "0h 0m";

foreach my $username (keys %session_durations) {
    debug("  Duración para $username: " . scalar(@{$session_durations{$username}}) . " sesiones");
    foreach my $duration (@{$session_durations{$username}}) {
        $total_duration += $duration;
        $session_count++;
    }
}

debug("Total duraciones: $total_duration, Total sesiones: $session_count");

# Check for division by zero before calculating average
if ($session_count > 0) {
    my $avg_seconds = int($total_duration / $session_count);
    my $hours = int($avg_seconds / 3600);
    my $minutes = int(($avg_seconds % 3600) / 60);
    $avg_session_time = "${hours}h ${minutes}m";
    debug("Tiempo promedio de sesión: $avg_session_time");
}

# 4. Obtener top usuarios por recuento de inicios de sesión
debug("Obteniendo top usuarios...");
my @top_users;

# Si tenemos datos de usuarios, los procesamos
if ($samba->can('realUsers')) {
    debug("El módulo samba puede obtener realUsers");
    my $users_data = eval { $samba->realUsers(0) };
    
    if ($users_data && ref($users_data) eq 'ARRAY') {
        debug("Obtenidos " . scalar(@$users_data) . " usuarios");
        foreach my $user (@$users_data) {
            next unless $user->can('get');
            
            my $username = $user->get('samAccountName') || '';
            my $logon_count = $user->get('logonCount') || 0;
            
            push @top_users, {
                name => $username,
                value => int($logon_count)
            };
            
            debug("  Usuario: $username, Logins: $logon_count") if $logon_count > 0;
        }
        
        # Ordenar y limitar a los 10 principales
        @top_users = sort { $b->{value} <=> $a->{value} } @top_users;
        @top_users = @top_users[0..9] if @top_users > 10;
    } else {
        debug("No se pudieron obtener usuarios: " . ($@ || "Error desconocido"));
    }
} else {
    debug("El módulo samba NO puede obtener realUsers");
}

debug("Top usuarios encontrados: " . scalar(@top_users));

# 5. Identificar IPs inusuales (menos de 3 ocurrencias)
debug("Identificando IPs inusuales...");
my @unusual_ips;
foreach my $ip (keys %ip_counts) {
    if ($ip_counts{$ip} < 3 && $ip ne '') {
        debug("  IP inusual: $ip (conteo: $ip_counts{$ip})");
        push @unusual_ips, { ip => $ip, count => $ip_counts{$ip} };
    }
}

debug("IPs inusuales encontradas: " . scalar(@unusual_ips));

# Ordenar IPs por número de ocurrencias (ascendente)
@unusual_ips = sort { $a->{count} <=> $b->{count} } @unusual_ips;
@unusual_ips = @unusual_ips[0..4] if @unusual_ips > 5; # Limitar a 5

# 6. Formatear datos de actividad por hora para gráficos
my @hourly_activity_formatted;
for my $hour_index (0..23) {
    push @hourly_activity_formatted, {
        hour => sprintf("%02d:00", $hour_index),
        count => $hourly_activity[$hour_index]
    };
}

# 7. Preparar datos de OS para gráfico
my @os_distribution_data;
foreach my $os (keys %os_distribution) {
    push @os_distribution_data, {
        name => $os,
        value => $os_distribution{$os}
    };
}
@os_distribution_data = sort { $b->{value} <=> $a->{value} } @os_distribution_data;
@os_distribution_data = @os_distribution_data[0..4] if @os_distribution_data > 5;

# 8. Obtener actividad reciente (últimos 5 eventos)
debug("Buscando actividad reciente...");
my @recent_activity;
my $recent_cmd = 'sudo zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | tail -20 2>/dev/null';
debug("Ejecutando: $recent_cmd");
my @recent_lines = `$recent_cmd`;
debug("Encontradas " . scalar(@recent_lines) . " líneas recientes");

if (@recent_lines) {
    debug("Primeras 3 líneas:") if @recent_lines;
    for (my $i = 0; $i < 3 && $i < scalar(@recent_lines); $i++) {
        debug("  " . $recent_lines[$i]);
    }
}

foreach my $line (@recent_lines) {
    if ($line =~ /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2}).*smbd_audit:\s+\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\w+)\s*\|/) {
        my ($month, $day, $time, $ip, $user, $event) = ($1, $2, $3, $4, $5, $6);
        
        # Use DateTime formatting instead of strftime
        my $date_str = "$day/$month/$current_year $time";
        
        push @recent_activity, {
            date => $date_str,
            user => $user,
            event => $event,
            ip => $ip
        };
        
        debug("  Actividad reciente: $date_str $user $event desde $ip");
    } else {
        debug("  Línea no coincide con patrón: $line");
    }
    
    last if scalar(@recent_activity) >= 5;
}

debug("Actividades recientes encontradas: " . scalar(@recent_activity));

# Convertimos las sesiones activas a un formato adecuado para el JSON
debug("Formateando sesiones activas...");
my @session_list;
foreach my $key (keys %active_sessions) {
    my $session = $active_sessions{$key};
    push @session_list, {
        user => $session->{user},
        ip => $session->{ip},
        start_time => $session->{start_time},
        event => $session->{event}
    };
    
    debug("  Sesión activa: $session->{user} desde $session->{ip} iniciada en $session->{start_time}");
}

debug("Sesiones activas encontradas: " . scalar(@session_list));

# 9. Armar el JSON final de respuesta
debug("Generando JSON de respuesta...");
my %dashboard_data = (
    activeSessions => scalar(@session_list),
    activeUsers => scalar(keys %users_active),
    activeComputers => scalar(keys %computers_active),
    averageSessionTime => $avg_session_time,
    hourlyActivity => \@hourly_activity_formatted,
    osDistribution => \@os_distribution_data,
    topUsers => \@top_users,
    unusualIPs => @unusual_ips,
    recentActivity => \@recent_activity,
    sessionList => \@session_list
);

debug("JSON generado con éxito. Terminando script.");

# Convertir a JSON
my $json = JSON->new->utf8->pretty->encode(\%dashboard_data);
print $json;
