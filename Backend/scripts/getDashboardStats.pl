#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;
use DateTime::Format::Strptime;

# Inicializar Zentyal/EBox
use EBox;
use EBox::Samba;

EBox::init();
my $samba = EBox::Global->modInstance('samba');

# Variables para fecha/hora
my $now = DateTime->now(time_zone => 'local');
my $week_ago = $now->clone->subtract(days => 7);
my $three_hours_ago = $now->clone->subtract(hours => 3);

# Formateador para parsear fechas del log
my $date_format = DateTime::Format::Strptime->new(
    pattern => '%b %d %H:%M:%S',
    time_zone => 'local',
    on_error => 'croak',
);

# Estructuras para tracking
my %active_sessions;       # IP => {user, start_time, event}
my %users_active;          # username => count
my %ip_counts;             # IP => count
my @hourly_activity = (0) x 24;
my %session_durations;     # Para calcular tiempo promedio
my %os_distribution;       # SO => count

# 1. Procesamos logs para identificar sesiones activas
my $logs_cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\'';
my @log_lines = `$logs_cmd`;

# Obtener año actual para completar las fechas de log
my $current_year = $now->year;

# Procesar logs
foreach my $line (@log_lines) {
    chomp $line;
    # Formato típico: "May 15 10:30:15 hostname smbd_audit: |ip|user|connect|"
    if ($line =~ /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2}).*smbd_audit:\s+\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\w+)\s*\|/) {
        my ($month, $day, $time, $ip, $username, $event) = ($1, $2, $3, $4, $5, $6);
        
        # Crear un timestamp completo
        my $timestamp_str = "$month $day $time";
        my $log_date = eval {
            my $dt = $date_format->parse_datetime($timestamp_str);
            $dt->set(year => $current_year);
            
            # Corregir el año si la fecha parece estar en el futuro
            if ($dt > $now && $dt->subtract(years => 1) <= $now) {
                $dt->subtract(years => 1);
            }
            return $dt;
        };
        
        next unless $log_date; # Saltamos si hay error en la fecha
        
        # Actualizar conteo por hora
        my $hour = $log_date->hour;
        $hourly_activity[$hour]++;
        
        # Contar IPs para detectar inusuales
        $ip_counts{$ip}++;
        
        # Tracking de sesiones activas
        # Si es un evento de conexión, registramos la sesión
        if ($event eq 'connect') {
            $active_sessions{"$ip:$username"} = {
                user => $username,
                ip => $ip,
                start_time => $log_date,
                event => 'connect'
            };
            $users_active{$username}++;
        }
        # Si es un evento de desconexión, finalizamos la sesión activa y calculamos duración
        elsif ($event eq 'disconnect') {
            if (exists $active_sessions{"$ip:$username"}) {
                my $session_start = $active_sessions{"$ip:$username"}{start_time};
                my $duration = $log_date->epoch - $session_start->epoch;
                
                # Guardar duración para estadísticas (solo si parece válida)
                if ($duration > 0 && $duration < 86400) { # < 24 horas
                    push @{$session_durations{$username}}, $duration;
                }
                
                # Remover la sesión activa
                delete $active_sessions{"$ip:$username"};
                $users_active{$username}-- if $users_active{$username} > 0;
            }
        }
    }
}

# 2. Obtener información de computadoras
my %computers_active;
my %computers_by_location;

# Comando para listar ordenadores
my $computer_list_cmd = "samba-tool computer list";
my @computer_names = `$computer_list_cmd`;
chomp @computer_names;

foreach my $computer_name (@computer_names) {
    # Solo procesamos nombres válidos
    next unless $computer_name =~ /\S/;
    
    # Añadir $ si no lo tiene
    $computer_name .= '$' unless $computer_name =~ /\$$/ || $computer_name eq "";
    
    # Obtener detalles del ordenador
    my $cmd = "samba-tool computer show \"$computer_name\"";
    my @output = `$cmd 2>/dev/null`;
    
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

# 3. Calcular tiempo promedio de sesión
my $total_duration = 0;
my $session_count = 0;
my $avg_session_time = "0h 0m";

foreach my $username (keys %session_durations) {
    foreach my $duration (@{$session_durations{$username}}) {
        $total_duration += $duration;
        $session_count++;
    }
}

if ($session_count > 0) {
    my $avg_seconds = int($total_duration / $session_count);
    my $hours = int($avg_seconds / 3600);
    my $minutes = int(($avg_seconds % 3600) / 60);
    $avg_session_time = "${hours}h ${minutes}m";
}

# 4. Obtener top usuarios por recuento de inicios de sesión
my $users_data = $samba->realUsers(0);
my @top_users;

foreach my $user (@$users_data) {
    my $username = $user->get('samAccountName');
    my $logon_count = $user->get('logonCount') || 0;
    
    push @top_users, {
        name => $username,
        value => int($logon_count)
    };
}

# Ordenar y limitar a los 10 principales
@top_users = sort { $b->{value} <=> $a->{value} } @top_users;
@top_users = @top_users[0..9] if @top_users > 10;

# 5. Identificar IPs inusuales (menos de 3 ocurrencias)
my @unusual_ips;
foreach my $ip (keys %ip_counts) {
    if ($ip_counts{$ip} < 3 && $ip ne '') {
        push @unusual_ips, { ip => $ip, count => $ip_counts{$ip} };
    }
}

# Ordenar IPs por número de ocurrencias (ascendente)
@unusual_ips = sort { $a->{count} <=> $b->{count} } @unusual_ips;
@unusual_ips = @unusual_ips[0..4] if @unusual_ips > 5; # Limitar a 5

# 6. Formatear datos de actividad por hora para gráficos
my @hourly_activity_formatted;
for my $hour (0..23) {
    push @hourly_activity_formatted, {
        hour => sprintf("%02d:00", $hour),
        count => $hourly_activity[$hour]
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
my @recent_activity;
my $recent_cmd = 'zgrep -a "smbd_audit:" /var/log/syslog* | sed \'s/^[^:]*://\' | tail -20';
my @recent_lines = `$recent_cmd`;

foreach my $line (@recent_lines) {
    if ($line =~ /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2}).*smbd_audit:\s+\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\w+)\s*\|/) {
        my ($month, $day, $time, $ip, $user, $event) = ($1, $2, $3, $4, $5, $6);
        
        push @recent_activity, {
            date => "$day/$month/$current_year $time",
            user => $user,
            event => $event,
            ip => $ip
        };
    }
    
    last if scalar(@recent_activity) >= 5;
}

# 9. Armar el JSON final de respuesta
my %dashboard_data = (
    activeSessions => scalar(keys %active_sessions),
    activeUsers => scalar(keys %users_active),
    activeComputers => scalar(keys %computers_active),
    averageSessionTime => $avg_session_time,
    hourlyActivity => \@hourly_activity_formatted,
    osDistribution => \@os_distribution_data,
    topUsers => \@top_users,
    unusualIPs => \@unusual_ips,
    recentActivity => \@recent_activity,
    sessionList => [map { $active_sessions{$_} } keys %active_sessions]
);

# Convertir a JSON
my $json = JSON->new->utf8->pretty->encode(\%dashboard_data);
print $json;
