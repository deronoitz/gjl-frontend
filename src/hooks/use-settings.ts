import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  monthly_fee: {
    amount: number;
    currency: string;
  };
  qris_fee: {
    percentage: number;
  };
  app_name: string;
  contact_info?: {
    phone: string;
    email: string;
    address: string;
  };
}

const defaultSettings: AppSettings = {
  monthly_fee: {
    amount: 150000,
    currency: 'IDR'
  },
  qris_fee: {
    percentage: 0.7
  },
  app_name: 'Griya Jannatin Leyangan'
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      // Merge with defaults to ensure all required fields exist
      const mergedSettings = {
        ...defaultSettings,
        ...data
      };

      setSettings(mergedSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep default settings on error
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh settings after successful update
        await fetchSettings();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to update settings' };
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to update settings' 
      };
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
