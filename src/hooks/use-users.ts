import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function useUsers() {
  const [error, setError] = useState<string | null>(null);

  const {
    users,
    isLoading,
    setLoading,
    fetchUsers,
    addUser,
    updateUser,
    removeUser,
  } = useAppStore();

  // Create user
  const createUser = useCallback(
    async (userData: {
      houseNumber: string;
      password: string;
      role?: 'admin' | 'user';
      fullName?: string;
      phone?: string;
      email?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create user');
        }

        const newUser = await response.json();
        
        // Add to store
        addUser({
          id: newUser.id,
          houseNumber: newUser.house_number,
          name: newUser.name,
          password_hash: '', // Don't store password hash in client
          role: newUser.role,
          createdAt: new Date(newUser.created_at),
          updatedAt: new Date(newUser.updated_at || newUser.created_at),
        });

        return newUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addUser, setLoading]
  );

  // Update user
  const updateUserData = useCallback(
    async (
      userId: string,
      updates: {
        houseNumber?: string;
        role?: 'admin' | 'user';
        fullName?: string;
        phone?: string;
        email?: string;
        password?: string;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
        }

        const updatedUser = await response.json();

        // Update in store
        updateUser(userId, {
          houseNumber: updatedUser.house_number,
          role: updatedUser.role,
        });

        return updatedUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateUser, setLoading]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        // Remove from store
        removeUser(userId);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeUser, setLoading]
  );

  // Fetch users with error handling
  const refreshUsers = useCallback(async () => {
    try {
      setError(null);
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    }
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser: updateUserData,
    deleteUser,
    refreshUsers,
  };
}
