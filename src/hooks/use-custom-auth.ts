import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/lib/custom-auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
}

export function useCustomAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      setAuthState({
        user: data.user,
        loading: false,
        authenticated: data.authenticated,
      });
    } catch (error) {
      console.error('Session check error:', error);
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  };

  const login = useCallback(async (houseNumber: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ houseNumber, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          authenticated: true,
        });
        return true;
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to change password' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }, []);

  const changePhoneNumber = useCallback(async (phoneNumber: string): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    try {
      const response = await fetch('/api/auth/change-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local auth state with the new user data
        if (data.user) {
          setAuthState(prev => ({
            ...prev,
            user: prev.user ? {
              ...prev.user,
              ...data.user
            } : data.user
          }));
        }
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.error || 'Failed to change phone number' };
      }
    } catch (error) {
      console.error('Change phone number error:', error);
      return { success: false, message: 'Failed to change phone number' };
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkSession,
    changePassword,
    changePhoneNumber,
  };
}
