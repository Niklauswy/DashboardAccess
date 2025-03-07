import useSWR from 'swr';
import * as userService from '@/services/userService';
import { useState } from 'react';

/**
 * Hook para gestionar usuarios con SWR y servicios integrados
 */
export function useUsers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: users, error, mutate, isValidating } = useSWR(
    '/api/users', 
    userService.fetchUsers,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const refreshUsers = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const createUser = async (userData) => {
    try {
      await userService.createUser(userData);
      await mutate(); // Revalidar la lista de usuarios
      return true;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (username, userData) => {
    try {
      await userService.updateUser(username, userData);
      await mutate(); // Revalidar la lista de usuarios
      return true;
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (username) => {
    try {
      await userService.deleteUser(username);
      await mutate(); // Revalidar la lista de usuarios
      return true;
    } catch (error) {
      throw error;
    }
  };

  const batchActions = {
    updatePasswords: async (usernames, newPassword) => {
      try {
        await userService.batchUpdatePasswords(usernames, newPassword);
        await mutate(); // Revalidar la lista de usuarios
        return true;
      } catch (error) {
        throw error;
      }
    },
    deleteUsers: async (usernames) => {
      try {
        await userService.batchDeleteUsers(usernames);
        await mutate(); // Revalidar la lista de usuarios
        return true;
      } catch (error) {
        throw error;
      }
    }
  };

  return {
    users,
    error,
    isLoading: !users && !error,
    isRefreshing,
    isValidating,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    batchActions
  };
}
