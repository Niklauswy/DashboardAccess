#!/usr/bin/perl

use strict;
use warnings;
use JSON;

use EBox;
use EBox::Samba;

EBox::init();

my $samba = EBox::Global->modInstance('samba');

my $groups = $samba->groups();
my @group_names = map { $_->get('samAccountName') } @$groups;

my $json = JSON->new->utf8->pretty->encode(\@group_names);
print $json;
