import { useState, useEffect, useCallback } from 'react';
import { Announcement } from '@/types';

interface AnnouncementWithExtras extends Omit<Announcement, 'createdAt'> {
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
}

interface CreateAnnouncementData {
  title: string;
  content: string;
}

interface UpdateAnnouncementData {
  title: string;
  content: string;
}

interface UseAnnouncementsReturn {
  announcements: AnnouncementWithExtras[];
  isLoading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
  createAnnouncement: (data: CreateAnnouncementData) => Promise<AnnouncementWithExtras | null>;
  updateAnnouncement: (id: string, data: UpdateAnnouncementData) => Promise<AnnouncementWithExtras | null>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
  getAnnouncement: (id: string) => Promise<AnnouncementWithExtras | null>;
}

export function useAnnouncements(): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<AnnouncementWithExtras[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching announcements:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(async (data: CreateAnnouncementData): Promise<AnnouncementWithExtras | null> => {
    setError(null);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create announcement');
      }

      const newAnnouncement = await response.json();
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating announcement:', err);
      return null;
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, data: UpdateAnnouncementData): Promise<AnnouncementWithExtras | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update announcement');
      }

      const updatedAnnouncement = await response.json();
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id ? updatedAnnouncement : announcement
        )
      );
      return updatedAnnouncement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating announcement:', err);
      return null;
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete announcement');
      }

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting announcement:', err);
      return false;
    }
  }, []);

  const getAnnouncement = useCallback(async (id: string): Promise<AnnouncementWithExtras | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcement');
      }

      const announcement = await response.json();
      return announcement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching announcement:', err);
      return null;
    }
  }, []);

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
  };
}
