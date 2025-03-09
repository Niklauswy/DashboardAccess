import useSWR from 'swr';
import { useState } from 'react';

/**
 * Hook centralizado para todas las operaciones relacionadas con usuarios
 */
export function useUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Usamos un timestamp para forzar refrescos completos
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  
  // Función principal para obtener usuarios con caché
  const { data: users, error, mutate } = useSWR(
    [`/api/users`, refreshTimestamp],
    async ([url, timestamp]) => {
      // Agregamos un parámetro de timestamp para evitar caché del navegador
      const fetchUrl = `${url}?_t=${timestamp}`;
      const res = await fetch(fetchUrl, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      });
      if (!res.ok) throw new Error('Error cargando usuarios');
      return res.json();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      dedupingInterval: 1000, // Reducido para permitir actualizaciones frecuentes
      revalidateIfStale: false,
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
  );

  // Función para refrescar datos de manera agresiva
  const refreshUsers = async () => {
    setIsRefreshing(true);
    try {
      // Actualizamos el timestamp para forzar un fetch completo
      setRefreshTimestamp(Date.now());
      // Forzamos una revalidación completa sin usar caché
      await mutate(undefined, { revalidate: true });
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
    
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const contentType = res.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await res.json() : null;
      
      if (!res.ok || (data && data.error)) {
        throw new Error(data?.error || 'Error al eliminar usuario');
      }
      
      // Forzamos un refresco completo después de eliminar
      await refreshUsers();
      return data || { success: true };
    } catch (error) {
      await refreshUsers(); // Intentamos refrescar incluso en caso de error
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
