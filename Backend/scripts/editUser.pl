#!/usr/bin/perl

use strict;
use warnings;
use JSON;
use EBox;
use EBox::Samba::User;
use File::Slurp;
use Try::Tiny;
use EBox::Samba::OU; 

# Function to print debug messages to STDERR
sub debug {
    my ($msg) = @_;
    print STDERR "[DEBUG] $msg\n";
    return;
}

# Constantes y configuración
my $DOMAIN = "dc=access,dc=com";
my $PASSWORD_REGEX = qr/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

# Función unificada para manejar errores
sub error_exit {
    my ($message, $details) = @_;
    debug($message);
    my $error_data = { error => $message };
    $error_data->{details} = $details if $details;
    print encode_json($error_data);
    exit(1);
}

EBox::init();

my $json_text = do { local $/; <STDIN> };

# Decodificar JSON de entrada
my $user_data;
try {
    $user_data = decode_json($json_text);
    debug("Datos JSON recibidos: $json_text"); # Mostrar datos recibidos para depuración
} catch {
    error_exit('Datos JSON inválidos', "$_");
};

# Extraer datos del usuario
my $samAccountName = $user_data->{samAccountName} || '';
my $originalUsername = $user_data->{originalUsername} || $samAccountName; # Para cuando se cambia el nombre de usuario
my $givenName = $user_data->{givenName} || '';
my $sn = $user_data->{sn} || '';
my $password = $user_data->{password}; # Opcional, solo si se actualiza
my $ou = $user_data->{ou} || '';
my $groups = ref($user_data->{groups}) eq 'ARRAY' ? $user_data->{groups} : [];
my $description = $user_data->{description} || '';

# Validar que tenemos un usuario para editar
error_exit("Nombre de usuario obligatorio") unless $originalUsername;
debug("Editando usuario: $originalUsername");

# Si se proporcionó contraseña, validarla
if ($password) {
    error_exit("La contraseña debe tener al menos 8 caracteres") if length($password) < 8;
    error_exit("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número") 
        unless $password =~ $PASSWORD_REGEX;
}

# Verificar si el usuario original existe
my $samba = EBox::Global->modInstance('samba');
my $users = $samba->realUsers(0);
my ($user) = grep { $_->get('samAccountName') eq $originalUsername } @$users;

error_exit("El usuario '$originalUsername' no existe") unless $user;

# Si se cambia el nombre de usuario, verificar que el nuevo no exista
if ($samAccountName ne $originalUsername) {
    my ($existingUser) = grep { $_->get('samAccountName') eq $samAccountName } @$users;
    error_exit("Ya existe un usuario con el nombre '$samAccountName'") if $existingUser;
}

try {
    # Actualizar datos de usuario
    if ($givenName) {
        $user->set('givenName', $givenName);
        debug("Nombre actualizado: $givenName");
    }
    
    if ($sn) {
        $user->set('sn', $sn);
        debug("Apellido actualizado: $sn");
    }
    
    if ($description) {
        $user->set('description', $description);
        debug("Descripción actualizada");
    }
    
    # Si se proporciona un nuevo nombre de usuario
    if ($samAccountName ne $originalUsername) {
        $user->set('samAccountName', $samAccountName);
        debug("Nombre de usuario actualizado: $originalUsername -> $samAccountName");
    }
    
    # Si se proporciona nueva contraseña
    if ($password) {
        $user->setPassword($password);
        debug("Contraseña actualizada");
    }
    
    # Guardar cambios
    $user->save();
    debug("Datos básicos actualizados exitosamente");
    
} catch {
    my $error_msg = $_;
    error_exit("Error al actualizar usuario", "$error_msg");
};

# Si se especifica OU, mover el usuario
if ($ou) {
    # Validar OU
    my $list_ous_cmd = "sudo samba-tool ou list";
    my @available_ous = split(/\n/, qx($list_ous_cmd));
    my $ou_exists = 0;
    
    foreach my $available_ou (@available_ous) {
        $available_ou =~ s/^\s+|\s+$//g;  # trim
        $available_ou =~ s/^OU=//i;       # remove prefix
        if (lc($available_ou) eq lc($ou)) {
            $ou_exists = 1;
            $ou = $available_ou;  # usar el caso exacto
            last;
        }
    }
    
    error_exit("La carrera (OU) '$ou' no existe") unless $ou_exists;
    
    my $ou_dn = "ou=$ou,$DOMAIN";
    my $commandMove = "sudo samba-tool user move \"$samAccountName\" \"$ou_dn\" -d 3";
    debug("Moviendo usuario $samAccountName a la OU: $ou_dn");
    my $outputMove = qx($commandMove 2>&1);

    if ($? != 0) {
        debug("Error al mover usuario: $outputMove");
        error_exit("Error al mover el usuario a la OU especificada", $outputMove);
    } else {
        debug("Usuario $samAccountName movido exitosamente a OU $ou");
    }
}

# Actualizar grupos
if (@$groups) {
    # Obtener los grupos actuales del usuario
    my $currentGroupsCmd = "sudo samba-tool user getgroups \"$samAccountName\"";
    my $currentGroupsOutput = qx($currentGroupsCmd 2>&1);
    my @currentGroups = split(/\n/, $currentGroupsOutput);
    @currentGroups = grep { $_ ne "" } @currentGroups; # Eliminar líneas vacías
    debug("Grupos actuales: " . join(", ", @currentGroups));
    
    # Validar que los grupos nuevos existen
    foreach my $groupName (@$groups) {
        next unless $groupName =~ /\S/;
        my $checkGroup = `sudo samba-tool group show "$groupName" 2>/dev/null`;
        error_exit("El grupo '$groupName' no existe") unless $checkGroup;
    }
    
    # Remover usuario de grupos actuales que no están en la nueva lista
    foreach my $currentGroup (@currentGroups) {
        next unless $currentGroup =~ /\S/;
        next if grep { $_ eq $currentGroup } @$groups;
        
        my $commandRemoveGroup = "sudo samba-tool group removemembers \"$currentGroup\" \"$samAccountName\"";
        my $outputRemoveGroup = qx($commandRemoveGroup 2>&1);
        
        if ($? != 0) {
            debug("Error al remover del grupo $currentGroup: $outputRemoveGroup");
            # No salimos por error para intentar completar el resto de operaciones
        } else {
            debug("Usuario $samAccountName removido del grupo $currentGroup");
        }
    }
    
    # Añadir usuario a nuevos grupos
    foreach my $groupName (@$groups) {
        next unless $groupName =~ /\S/;
        next if grep { $_ eq $groupName } @currentGroups;
        
        my $commandAddGroup = "sudo samba-tool group addmembers \"$groupName\" \"$samAccountName\"";
        my $outputAddGroup = qx($commandAddGroup 2>&1);
        
        if ($? != 0) {
            debug("Error al añadir al grupo $groupName: $outputAddGroup");
            # No salimos por error para intentar completar el resto de operaciones
        } else {
            debug("Usuario $samAccountName añadido al grupo $groupName");
        }
    }
}

# Respuesta exitosa
print encode_json({ success => "Usuario actualizado correctamente" });
exit(0);
