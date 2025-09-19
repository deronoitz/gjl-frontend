import { useState, useEffect } from 'react';

export interface Position {
  id: string;
  position: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePositionData {
  position: string;
  order: number;
}

export interface UpdatePositionData {
  position?: string;
  order?: number;
}

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all positions
  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/positions');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch positions');
      }
      
      const positionData = await response.json();
      // Sort by order field
      const sortedPositions = positionData.sort((a: Position, b: Position) => a.order - b.order);
      setPositions(sortedPositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new position
  const createPosition = async (positionData: CreatePositionData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create position');
      }
      
      const newPosition = await response.json();
      setPositions(prevPositions => 
        [...prevPositions, newPosition].sort((a, b) => a.order - b.order)
      );
      return newPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update position
  const updatePosition = async (positionId: string, positionData: UpdatePositionData) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update position');
      }
      
      const updatedPosition = await response.json();
      setPositions(prevPositions =>
        prevPositions
          .map(pos => pos.id === positionId ? updatedPosition : pos)
          .sort((a, b) => a.order - b.order)
      );
      return updatedPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete position
  const deletePosition = async (positionId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete position');
      }
      
      setPositions(prevPositions => 
        prevPositions.filter(pos => pos.id !== positionId)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return {
    positions,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
    refetch: fetchPositions,
  };
}
