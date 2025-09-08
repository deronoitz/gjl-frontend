import { useState, useEffect } from 'react';

export interface Resident {
  id: string;
  house_number: string;
  name: string;
  phone_number?: string;
  positions?: {
    id: string;
    position: string;
    order: number;
  };
}

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all residents
  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/warga');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch residents');
      }
      
      const residentsData = await response.json();
      setResidents(residentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch residents');
      console.error('Error fetching residents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return {
    residents,
    loading,
    error,
    refetch: fetchResidents
  };
}
