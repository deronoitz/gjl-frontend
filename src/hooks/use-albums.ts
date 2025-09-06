import { useState, useEffect } from 'react';
import { Album } from '@/types';

interface UseAlbumsReturn {
  albums: Album[];
  loading: boolean;
  error: string | null;
  createAlbum: (title: string, driveUrl: string, coverImage: File | null, authorId: string) => Promise<boolean>;
  updateAlbum: (id: string, title: string, driveUrl: string, coverImage?: File | null) => Promise<boolean>;
  deleteAlbum: (id: string) => Promise<boolean>;
  refreshAlbums: () => Promise<void>;
}

export function useAlbums(): UseAlbumsReturn {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/albums');
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      
      const data = await response.json();
      
      // Transform data to match Album interface
      const transformedAlbums: Album[] = data.map((album: {
        id: string;
        title: string;
        cover_image_url: string;
        drive_url: string;
        created_at: string;
        author_id: string;
        users?: { name: string };
      }) => ({
        id: album.id,
        title: album.title,
        coverImageUrl: album.cover_image_url || '',
        driveUrl: album.drive_url,
        createdAt: new Date(album.created_at),
        authorId: album.author_id,
        authorName: album.users?.name || 'Unknown'
      }));
      
      setAlbums(transformedAlbums);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (
    title: string,
    driveUrl: string,
    coverImage: File | null,
    authorId: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('driveUrl', driveUrl);
      formData.append('authorId', authorId);
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await fetch('/api/albums', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create album');
      }

      const newAlbum = await response.json();
      
      // Transform and add to state
      const transformedAlbum: Album = {
        id: newAlbum.id,
        title: newAlbum.title,
        coverImageUrl: newAlbum.cover_image_url || '',
        driveUrl: newAlbum.drive_url,
        createdAt: new Date(newAlbum.created_at),
        authorId: newAlbum.author_id,
        authorName: newAlbum.users?.name || 'Unknown'
      };
      
      setAlbums(prev => [transformedAlbum, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create album');
      console.error('Error creating album:', err);
      return false;
    }
  };

  const updateAlbum = async (
    id: string,
    title: string,
    driveUrl: string,
    coverImage?: File | null
  ): Promise<boolean> => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('driveUrl', driveUrl);
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await fetch(`/api/albums/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update album');
      }

      const updatedAlbum = await response.json();
      
      // Transform and update state
      const transformedAlbum: Album = {
        id: updatedAlbum.id,
        title: updatedAlbum.title,
        coverImageUrl: updatedAlbum.cover_image_url || '',
        driveUrl: updatedAlbum.drive_url,
        createdAt: new Date(updatedAlbum.created_at),
        authorId: updatedAlbum.author_id,
        authorName: updatedAlbum.users?.name || 'Unknown'
      };
      
      setAlbums(prev => prev.map(album => 
        album.id === id ? transformedAlbum : album
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update album');
      console.error('Error updating album:', err);
      return false;
    }
  };

  const deleteAlbum = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/albums/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete album');
      }

      setAlbums(prev => prev.filter(album => album.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete album');
      console.error('Error deleting album:', err);
      return false;
    }
  };

  const refreshAlbums = async () => {
    await fetchAlbums();
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return {
    albums,
    loading,
    error,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    refreshAlbums,
  };
}
