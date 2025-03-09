import useSWR from 'swr';
import { useState } from 'react';

/**
 * Hook centralizado para todas las operaciones relacionadas con usuarios
 */
export function useUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Función principal para obtener usuarios con caché
  const { data: users, error, mutate } = useSWR(
    '/api/users',
    async (url) => {
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (!res.ok) throw new Error('Error cargando usuarios');
      return res.json();
    },
    {
      refreshInterval: 30000, // Revalidar cada 30 segundos
      revalidateOnFocus: true, // Revalidar cuando la ventana obtiene foco
      dedupingInterval: 5000, // Reducido a 5 segundos
      revalidateOnReconnect: true, // Revalidar cuando el navegador se reconecta
    }
  );

  // Función para refrescar datos
  const refreshUsers = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // CRUD básico para usuarios
  const createUser = async (userData) => {
    if (!userData || typeof userData !== 'object') {
      throw new Error('Datos de usuario inválidos');
    }
    
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Error al crear usuario');
    }
    
    await mutate(); // Actualiza la caché de usuarios
    return res.json();
  };

  const updateUser = async (username, userData) => {
    if (!username || typeof username !== 'string') {
      throw new Error('Nombre de usuario inválido');
    }
    
    const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Error al actualizar usuario');
    }
    
    await mutate(); // Actualiza la caché de usuarios
    return res.json();
  };

  const deleteUser = async (username) => {
    if (!username || typeof username !== 'string') {
      throw new Error('Nombre de usuario inválido');
    }
    
    // Actualización optimista: Eliminar usuario de la UI inmediatamente
    const currentUsers = users || [];
    const optimisticData = currentUsers.filter(user => 
      user.username !== username && user.samAccountName !== username
    );
    
    try {
      // Actualiza la UI inmediatamente y luego hace la petición
      await mutate(optimisticData, false);
      
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      
      const contentType = res.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await res.json() : null;
      
      if (!res.ok || (data && data.error)) {
        throw new Error(data?.error || 'Error al eliminar usuario');
      }
      
      // Revalidar los datos después de la eliminación exitosa
      await mutate();
      return data || { success: true };
    } catch (error) {
      // Si falla, revertir la actualización optimista
      await mutate();
      throw error;
    }
  };

  // Operaciones por lotes
  const batchActions = {
    updatePasswords: async (usernames, newPassword) => {
      if (!Array.isArray(usernames) || !usernames.length || !newPassword) {
        throw new Error('Parámetros inválidos');
      }
      
      const res = await fetch('/api/users/batch/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames, password: newPassword }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Error al actualizar contraseñas');
      }
      
      await mutate(); // Actualiza la caché de usuarios
      return res.json();
    },
    
    deleteUsers: async (usernames) => {
      if (!Array.isArray(usernames) || !usernames.length) {
        throw new Error('Lista de usuarios inválida');
      }
      
      // Ejecutar múltiples eliminaciones en secuencia
      const results = [];
      for (const username of usernames) {
        try {
          const result = await deleteUser(username);
          results.push({ username, success: true, result });
        } catch (error) {
          results.push({ username, success: false, error: error.message });
        }
      }
      
      await mutate(); // Actualiza la caché de usuarios
      return results;
    }
  };

  return {
    // Datos y estado
    users,
    error,
    isLoading: !users && !error,
    isRefreshing,
    
    // Funciones
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    batchActions,
  };
}
