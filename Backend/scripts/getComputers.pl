#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use DateTime;
use Parallel::ForkManager;

# Configuration
my $max_processes = 20; # Adjust based on your system's capabilities

my %grouped_data;
my @computers;

# Define the command to extract computer names and IP addresses
my $command = q{
    grep -hEa '.*\$@.*LDAP/[^/]+@' /var/log/samba/samba.log* | 
    awk '{split($3, a, "@"); split($5, b, ":"); print a[1], b[2]}' 
};

# Execute the command and capture the output
my @lines = `$command`;
chomp @lines;

# Populate the @computers array
foreach my $line (@lines) {
    next if $line =~ /^\s*$/; # Skip empty lines
    my ($computer, $ip) = split /\s+/, $line;
    next unless defined $computer && defined $ip; # Ensure both fields are present
    push @computers, { computer => $computer, ip => $ip };
}

# Initialize Parallel::ForkManager
my $pm = Parallel::ForkManager->new($max_processes);

# Handle data returned from child processes
$pm->run_on_finish(
    sub {
        my ($pid, $exit_code, $ident, $exit_signal, $core_dump, $data_ref) = @_;
        if (defined $data_ref && exists $data_ref->{data}) {
            my $data = $data_ref->{data};
            if ($data && defined $data->{Lugar}) {
                push @{$grouped_data{$data->{Lugar}}}, {
                    lastLogon        => $data->{lastLogon},
                    logonCount       => $data->{logonCount},
                    operatingSystem  => $data->{operatingSystem},
                    id               => $data->{id},
                    IP               => $data->{IP},
                    status           => $data->{status},
                };
            }
        }
    }
);

# Process each computer in parallel
foreach my $entry (@computers) {
    $pm->start and next; # Forks and returns the pid for the child

    my $computer = $entry->{computer};
    my $ip       = $entry->{ip};

    my $data = get_computer_info($computer, $ip);
    
    # Send data back to the parent process
    $pm->finish(0, { data => $data });
}

$pm->wait_all_children;

# Encode the grouped data as JSON and print
my $json = JSON->new->utf8->pretty->encode(\%grouped_data);
print $json, "\n";


sub get_computer_info {
    my ($computer, $ip) = @_;

    # Ensure the computer name has the trailing '$'
    $computer .= '$' unless $computer =~ /\$$/;

    my $command = "samba-tool computer show \"$computer\"";
    my @output = `$command 2>/dev/null`;
    my $exit_code = $? >> 8;

    return undef if $exit_code != 0 || !@output;

    my %info;
    my $nombre_completo = '';
    my $lastLogon_epoch = 0;

    foreach my $line (@output) {
        chomp $line;
        # Use case-insensitive matching and allow for spaces around the colon
        if ($line =~ /^lastLogon\s*:\s*(\d+)/i) {
            $lastLogon_epoch = $1;
            $info{lastLogon} = convert_epoch($lastLogon_epoch);
        } elsif ($line =~ /^logonCount\s*:\s*(\d+)/i) {
            $info{logonCount} = $1;
        } elsif ($line =~ /^operatingSystem\s*:\s*(.+)/i) {
            $info{operatingSystem} = $1;
        } elsif ($line =~ /^name\s*:\s*(.+)/i) {
            $nombre_completo = $1;
        }
    }

    # Ensure 'nombre_completo' was captured
    if ($nombre_completo ne '') {
        my ($lugar, $id) = split(/-/, $nombre_completo, 2);
        $info{Lugar} = defined $lugar && $lugar ne '' ? $lugar : 'Unknown';
        $info{id}    = defined $id    && $id    ne '' ? $id    : 'Unknown';
    } else {
        $info{Lugar} = 'Unknown';
        $info{id}    = 'Unknown';
    }

    $info{IP}    = defined $ip && $ip ne '' ? $ip : 'Unknown';
    $info{status} = determine_status($lastLogon_epoch);

    # Set default values if undefined
    $info{lastLogon}       ||= 'Unknown';
    $info{logonCount}      ||= 0;
    $info{operatingSystem} ||= 'Unknown';
    $info{id}              ||= 'Unknown';
    $info{IP}              ||= 'Unknown';
    $info{status}          ||= 'Activa';

    return \%info;
}

sub convert_epoch {
    my ($lastLogon) = @_;
    return 'Never' if $lastLogon == 0;
    my $epoch = ($lastLogon / 10000000) - 11644473600;
    # Ajustar a la zona horaria local (UTC-8)
    my $dt = DateTime->from_epoch(epoch => $epoch, time_zone => 'local');
    return $dt->strftime('%d/%m/%Y %H:%M:%S');
}

sub determine_status {
    my ($lastLogon) = @_;
    return 'Unknown' if $lastLogon == 0;

    my $lastLogon_epoch = ($lastLogon / 10000000) - 11644473600;
    my $dt_lastLogon = DateTime->from_epoch(epoch => $lastLogon_epoch, time_zone => 'local');
    my $dt_now = DateTime->now(time_zone => 'UTC');

    my $months_diff = ($dt_now->year - $dt_lastLogon->year) * 12 + ($dt_now->month - $dt_lastLogon->month);

    if ($months_diff > 3) {
        return 'Desconocido';
    } else {
        return 'Activa';
    }
}


