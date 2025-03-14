import useSWR from 'swr';
import {useState} from 'react';

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
    if (!userData || typeof userData !== 'object') {
      throw new Error('Datos de usuario inválidos');
    }
    
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    // Intentamos leer como JSON primero
    const data = await res.json();
    
    // Si hay error en la respuesta
    if (!res.ok || data.error) {
      // Creamos un objeto Error con el mensaje de error específico
      const error = new Error(data.error || 'Error al crear usuario');
      
      // Agregamos los detalles como propiedad del error para debugging
      if (data.details) {
        error.details = data.details;
      }
      
      throw error;
    }
    
    await mutate(); // Actualiza la caché de usuarios
    return data;
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
    
    const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
    
    const contentType = res.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await res.json() : null;
    
    if (!res.ok || (data && data.error)) {
      throw new Error(data?.error || 'Error al eliminar usuario');
    }
    
    await mutate(); // Actualiza la caché de usuarios
    return data || { success: true };
  };

  // Operaciones por lotes
  const batchActions = {
    updatePasswords: async (usernames, newPassword, progressCallback) => {
      if (!Array.isArray(usernames) || !usernames.length || !newPassword) {
        throw new Error('Parámetros inválidos');
      }
      
      // Create progress tracking object similar to deleteUsers
      const progressTracker = {
        total: usernames.length,
        completed: 0,
        success: [],
        errors: [],
      };
      
      // Process password changes sequentially
      for (const username of usernames) {
        try {
          // Use the existing updateUser function to change just the password
          await fetch(`/api/users/${encodeURIComponent(username)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
          });
          
          // Track success
          progressTracker.success.push({ username });
        } catch (error) {
          // Track error
          progressTracker.errors.push({ 
            username, 
            error: error.message 
          });
        }
        
        // Update progress
        progressTracker.completed++;
        if (progressCallback) {
          progressCallback(Math.round((progressTracker.completed / progressTracker.total) * 100));
        }
      }
      
      // Refresh the users list ONCE after all operations
      await mutate();
      
      return progressTracker;
    },
    
    deleteUsers: async (usernames, progressCallback) => {
      if (!Array.isArray(usernames) || !usernames.length) {
        throw new Error('Lista de usuarios inválida');
      }
      
      // Create progress tracking object
      const progressTracker = {
        total: usernames.length,
        completed: 0,
        success: [],
        errors: [],
      };
      
      // Process deletions sequentially
      for (const username of usernames) {
        try {
          const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
          });
          
          const contentType = res.headers.get('content-type');
          const data = contentType?.includes('application/json') ? await res.json() : null;
          
          if (!res.ok || (data && data.error)) {
            throw new Error(data?.error || 'Error al eliminar usuario');
          }
          
          // Track success
          progressTracker.success.push({ username, result: data });
        } catch (error) {
          // Track error
          progressTracker.errors.push({ 
            username, 
            error: error.message 
          });
        }
        
        // Actualizar progreso
        progressTracker.completed++;
        if (progressCallback) {
          progressCallback(Math.round((progressTracker.completed / progressTracker.total) * 100));
        }
      }
      
      // Refresh usuarios después de todas las operaciones
      await mutate();
      
      return progressTracker;
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
