import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        clearAuth: () => set({ user: null, isLoading: false }),
      }),
      {
        name: 'auth-storage',
        // Only persist user data, not loading state
        partialize: (state) => ({ user: state.user }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
