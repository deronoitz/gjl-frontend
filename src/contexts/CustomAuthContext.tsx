'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCustomAuth } from '@/hooks/use-custom-auth';
import { AuthUser } from '@/lib/custom-auth';

interface CustomAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  login: (houseNumber: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const CustomAuthContext = createContext<CustomAuthContextType | null>(null);

export function CustomAuthProvider({ children }: { children: ReactNode }) {
  const auth = useCustomAuth();

  return (
    <CustomAuthContext.Provider value={auth}>
      {children}
    </CustomAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(CustomAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within CustomAuthProvider');
  }
  return context;
}
