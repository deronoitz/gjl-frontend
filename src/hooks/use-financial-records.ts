import { useState, useEffect, useCallback } from 'react';

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  date: string;
  proof_url: string | null;
  house_block: string | null;
  user_uuid: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'done' | 'expired';
  payment_url: string | null;
  reference_id: string | null;
  user?: {
    id: string;
    name: string;
    house_number: string;
  };
  created_by_user?: {
    id: string;
    name: string;
  };
}

export interface FinancialSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
}

export interface FinancialRecordsResponse {
  data: FinancialRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: FinancialSummary;
}

export interface CreateFinancialRecordData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  house_block?: string;
  user_uuid?: string;
  proof_url?: string;
  status?: 'pending' | 'done' | 'expired';
  payment_url?: string;
}

export interface FinancialRecordsFilters {
  type?: 'income' | 'expense';
  category?: string;
  month?: string;
  year?: string;
  house_block?: string;
  page?: number;
  limit?: number;
  show_all_status?: string; // Special parameter for payment page to show all statuses
}

export interface HouseBlocksResponse {
  blocks?: Array<{ value: string; label: string }>;
  users?: Array<{ 
    id: string; 
    name: string; 
    house_block: string; 
    value: string; 
    label: string; 
  }>;
}

export function useFinancialRecords() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    total_income: 0,
    total_expense: 0,
    net_balance: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (filters: FinancialRecordsFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/financial-records?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FinancialRecordsResponse = await response.json();
      
      setRecords(data.data);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching financial records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecord = async (recordData: CreateFinancialRecordData): Promise<FinancialRecord | null> => {
    try {
      const response = await fetch('/api/financial-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create record');
      }

      const newRecord: FinancialRecord = await response.json();
      
      // Refresh records after creation
      fetchRecords();
      
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating financial record:', err);
      return null;
    }
  };

  const updateRecord = async (id: string, recordData: Partial<CreateFinancialRecordData>): Promise<FinancialRecord | null> => {
    try {
      const response = await fetch(`/api/financial-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update record');
      }

      const updatedRecord: FinancialRecord = await response.json();
      
      // Update local records
      setRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
      
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating financial record:', err);
      return null;
    }
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/financial-records/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }

      // Remove from local records
      setRecords(prev => prev.filter(record => record.id !== id));
      
      // Refresh to update summary and pagination
      fetchRecords();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting financial record:', err);
      return false;
    }
  };

  const uploadProof = async (file: File): Promise<{ url: string; fileName: string } | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload proof');
      }

      const data = await response.json();
      return { url: data.url, fileName: data.fileName };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error uploading proof:', err);
      return null;
    }
  };

  return {
    records,
    summary,
    pagination,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    uploadProof,
  };
}

export function useHouseBlocks() {
  const [blocks, setBlocks] = useState<Array<{ value: string; label: string }>>([]);
  const [users, setUsers] = useState<Array<{ 
    id: string; 
    name: string; 
    house_block: string; 
    value: string; 
    label: string; 
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHouseBlocks = useCallback(async (type: 'blocks' | 'users' | 'all' = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/house-blocks?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HouseBlocksResponse = await response.json();
      
      if (data.blocks) setBlocks(data.blocks);
      if (data.users) setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching house blocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHouseBlocks();
  }, [fetchHouseBlocks]);

  return {
    blocks,
    users,
    loading,
    error,
    refetch: fetchHouseBlocks,
  };
}
