#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use POSIX qw(strftime);

my $current_year = strftime "%Y", localtime;

my $cmd = q(zgrep -a "smbd_audit:" /var/log/syslog* | grep -Ei "connect|disconnect");

my @log_lines = `$cmd`;
my @user_data;

foreach my $line (@log_lines) {
    chomp($line);
    

    if ($line =~ /^(\w+)\s+(\d+)\s+(\d+:\d+:\d+).*?smbd_audit:\s+(.*)$/) {
        my $month = $1;
        my $day = $2;
        my $time = $3;
        my $audit_data = $4;
        

        my $month_num = month_to_num($month);
        $day = sprintf("%02d", $day);
        my $full_date = sprintf("%02d/%02d/%04d %s", $day, $month_num, $current_year, $time);
        my $date_only = sprintf("%02d/%02d/%04d", $day, $month_num, $current_year);
        
        
        if ($audit_data =~ /([^|]+)\|([^|]+)\|(connect|disconnect)\|([^|]+)\|([^|]+)/) {
            my $domain_user = $1;
            my $ip = $2;
            my $event = $3;
            my $status = $4;
            my $username = $5;
            
            
            push @user_data, {
                date      => $full_date,  
                date_only => $date_only,  # Date part only (DD/MM/YYYY)
                time      => $time,       # Time part only (HH:MM:SS)
                user      => $username,
                event     => $event,  
                ip        => $ip,
            };
        }
    }
}

# Sort by date (newest first)
@user_data = sort { $b->{date} cmp $a->{date} } @user_data;

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