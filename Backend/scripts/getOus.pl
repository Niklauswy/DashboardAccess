#!/usr/bin/perl
use strict;
use warnings;
use JSON;

use EBox;
use EBox::Global;
use EBox::Samba;

EBox::init();

my $samba = EBox::Global->modInstance('samba');

unless ($samba->isEnabled()) {
    die "El módulo Samba no está habilitado.\n";
}

my $ous = $samba->ous();

# excluir la OU "Domain Controllers"
my @filtered_ous = grep { $_->name ne 'Domain Controllers' } @$ous;

my @ou_names = map { $_->name } @filtered_ous;
my $json = JSON->new->utf8->pretty->encode([sort @ou_names]);

print $json;
