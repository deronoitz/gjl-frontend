'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCustomAuth } from '@/hooks/use-custom-auth';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (houseNumber: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { user, loading, authenticated, login, logout, changePassword } = useCustomAuth();

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: loading, 
      isAuthenticated: authenticated, 
      login, 
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
