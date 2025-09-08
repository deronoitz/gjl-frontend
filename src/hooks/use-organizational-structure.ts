import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function useOrganizationalStructure() {
  const [error, setError] = useState<string | null>(null);

  const {
    users,
    isLoading,
    fetchUsers,
  } = useAppStore();

  // Filter users with positions and sort by position order
  const usersWithPositions = users
    .filter(user => user.position_id && user.positions)
    .sort((a, b) => {
      // Sort by position order (lower order comes first)
      const orderA = a.positions?.order ?? 999;
      const orderB = b.positions?.order ?? 999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If same order, sort by name
      return a.name.localeCompare(b.name);
    });

  const statistics = {
    totalUsers: users.length,
    usersWithPositions: usersWithPositions.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
  };

  // Fetch users with error handling
  const refreshUsers = useCallback(async () => {
    try {
      setError(null);
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organizational structure';
      setError(errorMessage);
    }
  }, [fetchUsers]);

  // Fetch users on mount
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return {
    users: usersWithPositions,
    allUsers: users,
    statistics,
    isLoading,
    error,
    refreshUsers,
  };
}
