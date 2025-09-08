import { useState, useCallback } from 'react';

export interface PaymentRecord {
  id: number;
  user_uuid: string;
  bulan: number;
  tahun: number;
  created_at: string;
  created_by: string;
  users?: {
    name: string;
    house_number?: string;
  };
  created_by_user?: {
    name: string;
  };
}

export const usePaymentRecords = () => {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentRecords = useCallback(async (filters?: {
    userId?: string;
    bulan?: number;
    tahun?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.bulan) params.append('bulan', filters.bulan.toString());
      if (filters?.tahun) params.append('tahun', filters.tahun.toString());

      const response = await fetch(`/api/payment-status?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payment records');
      }

      setPaymentRecords(result.data || []);
    } catch (err) {
      console.error('Error fetching payment records:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPaymentRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paymentRecords,
    loading,
    error,
    fetchPaymentRecords,
  };
};
