import useSWR from 'swr';
import { useState, useCallback } from 'react';

/**
 * Hook centralizado para todas las operaciones relacionadas con usuarios
 */
export function useUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Función principal para obtener usuarios con caché
  const { data: users, error: swrError, mutate } = useSWR(
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
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error creating user');
      }
      
      setLoading(false);
      await mutate(); // Actualiza la caché de usuarios
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (username, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error updating user');
      }
      
      setLoading(false);
      await mutate(); // Actualiza la caché de usuarios
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting user: ${username}`);
      
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      // Always try to get text first, then parse as JSON if possible
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server response: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Error deleting user');
      }
      
      setLoading(false);
      await mutate(); // Actualiza la caché de usuarios
      return data;
    } catch (err) {
      console.error("Error in deleteUser hook:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [mutate]);

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
    error: error || swrError,
    isLoading: !users && !error,
    isRefreshing,
    loading,
    
    // Funciones
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    batchActions,
  };
}
