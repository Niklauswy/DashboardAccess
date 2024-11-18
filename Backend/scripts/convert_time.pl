#!/usr/bin/perl
use strict;
use warnings;
use DateTime;

# Verificar que se proporcione un parámetro
if (@ARGV != 1) {
    die "Uso: $0 <windows_filetime>\n";
}

# Obtener el FILETIME desde los argumentos
my $filetime = $ARGV[0];

# Validar que sea un número
if ($filetime !~ /^\d+$/) {
    die "Error: El parámetro debe ser un número válido.\n";
}

# Convertir FILETIME a una fecha legible
sub convert_windows_time {
    my ($filetime) = @_;
    
    # Si el FILETIME es 0, retornar "Never"
    return 'Never' if $filetime == 0;

    # Convertir FILETIME a segundos desde Unix epoch
    my $epoch = ($filetime / 10000000) - 11644473600;

    # Crear un objeto DateTime en la zona horaria local
    my $dt = DateTime->from_epoch(epoch => $epoch, time_zone => 'local');
    
    # Retornar la fecha en formato legible
    return $dt->strftime('%d/%m/%Y %H:%M:%S');
}

# Imprimir el resultado
print convert_windows_time($filetime), "\n";
