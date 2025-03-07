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
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error cargando usuarios');
      return res.json();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
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
    const res = await fetch(`/api/users/${username}`, {
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
    const res = await fetch(`/api/users/${username}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Error al eliminar usuario');
    }
    
    await mutate(); // Actualiza la caché de usuarios
    return true;
  };

  // Operaciones por lotes
  const batchActions = {
    updatePasswords: async (usernames, newPassword) => {
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
      const res = await fetch('/api/users/batch/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Error al eliminar usuarios');
      }
      
      await mutate(); // Actualiza la caché de usuarios
      return res.json();
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
