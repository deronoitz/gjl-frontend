import { useState, useCallback } from 'react';

export interface PaymentStatus {
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

export interface PaymentStatistics {
  totalUsers: number;
  paidUsers: number;
  unpaidUsers: number;
  paymentPercentage: number;
  unpaidUsersList: Array<{
    id: string;
    name: string;
    house_number: string;
  }>;
  recentPayments: PaymentStatus[];
  month: number;
  year: number;
}

export const usePaymentStatus = () => {
  const [paymentData, setPaymentData] = useState<PaymentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = useCallback(async (filters?: {
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
        throw new Error(result.error || 'Failed to fetch payment status');
      }

      setPaymentData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentStatus = useCallback(async (data: {
    user_uuid: string;
    bulan: number;
    tahun: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment status');
      }

      // Refresh data after successful creation
      await fetchPaymentStatus();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentStatus]);

  const createBulkPaymentStatus = useCallback(async (data: {
    user_uuids: string[];
    bulan: number;
    tahun: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-status/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bulk payment status');
      }

      // Refresh data after successful creation
      await fetchPaymentStatus();
      return result; // Return full result including stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentStatus]);

  const deletePaymentStatus = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-status', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete payment status');
      }

      // Refresh data after successful deletion
      await fetchPaymentStatus();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentStatus]);

  return {
    paymentData,
    loading,
    error,
    fetchPaymentStatus,
    createPaymentStatus,
    createBulkPaymentStatus,
    deletePaymentStatus,
  };
};

export const usePaymentStatistics = () => {
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async (bulan: number, tahun: number) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        bulan: bulan.toString(),
        tahun: tahun.toString(),
      });

      const response = await fetch(`/api/payment-status/statistics?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payment statistics');
      }

      setStatistics(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    statistics,
    loading,
    error,
    fetchStatistics,
  };
};
