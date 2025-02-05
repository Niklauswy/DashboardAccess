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

#Eliminar Domain Guests/Users ya que dan errores y agregar el grupo de Schema Admins a la lista.
@group_names = grep { $_ ne 'Domain Guests' && $_ ne 'Domain Users' } @group_names;
push @group_names, 'Schema Admins' unless grep { $_ eq 'Schema Admins' } @group_names;


my $json = JSON->new->utf8->pretty->encode(\@group_names);
print $json;
