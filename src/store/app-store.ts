import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, Payment, Announcement, GalleryImage, Album } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppState {
  // Users
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Payments
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  removePayment: (id: string) => void;

  // Announcements
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  removeAnnouncement: (id: string) => void;

  // Gallery
  galleryImages: GalleryImage[];
  setGalleryImages: (images: GalleryImage[]) => void;
  addGalleryImage: (image: GalleryImage) => void;
  updateGalleryImage: (id: string, updates: Partial<GalleryImage>) => void;
  removeGalleryImage: (id: string) => void;

  // Albums
  albums: Album[];
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  removeAlbum: (id: string) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  fetchGalleryImages: () => Promise<void>;
  fetchAlbums: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      users: [],
      payments: [],
      announcements: [],
      galleryImages: [],
      albums: [],
      isLoading: false,

      // Users actions
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        })),
      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),

      // Payments actions
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) =>
        set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (id, updates) =>
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...updates } : payment
          ),
        })),
      removePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        })),

      // Announcements actions
      setAnnouncements: (announcements) => set({ announcements }),
      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [...state.announcements, announcement],
        })),
      updateAnnouncement: (id, updates) =>
        set((state) => ({
          announcements: state.announcements.map((announcement) =>
            announcement.id === id ? { ...announcement, ...updates } : announcement
          ),
        })),
      removeAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter(
            (announcement) => announcement.id !== id
          ),
        })),

      // Gallery actions
      setGalleryImages: (galleryImages) => set({ galleryImages }),
      addGalleryImage: (image) =>
        set((state) => ({
          galleryImages: [...state.galleryImages, image],
        })),
      updateGalleryImage: (id, updates) =>
        set((state) => ({
          galleryImages: state.galleryImages.map((image) =>
            image.id === id ? { ...image, ...updates } : image
          ),
        })),
      removeGalleryImage: (id) =>
        set((state) => ({
          galleryImages: state.galleryImages.filter((image) => image.id !== id),
        })),

      // Albums actions
      setAlbums: (albums) => set({ albums }),
      addAlbum: (album) => set((state) => ({ albums: [...state.albums, album] })),
      updateAlbum: (id, updates) =>
        set((state) => ({
          albums: state.albums.map((album) =>
            album.id === id ? { ...album, ...updates } : album
          ),
        })),
      removeAlbum: (id) =>
        set((state) => ({
          albums: state.albums.filter((album) => album.id !== id),
        })),

      // Loading
      setLoading: (isLoading) => set({ isLoading }),

      // Async actions
      fetchUsers: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform data to match User interface
          const users = data.map((profile) => ({
            id: profile.id,
            houseNumber: profile.house_number,
            name: profile.name || 'Unknown',
            password_hash: '', // Don't expose password hash
            role: profile.role as 'admin' | 'user',
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at || profile.created_at),
          }));

          set({ users });
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPayments: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('payment_date', { ascending: false });

          if (error) throw error;

          const payments = data.map((payment) => ({
            id: payment.id,
            houseBlock: payment.house_block,
            paymentDate: new Date(payment.payment_date),
            amount: payment.amount,
            description: payment.description,
            status: payment.status as 'paid' | 'pending',
            userId: payment.user_id,
            type: payment.type as 'income' | 'expense',
            category: payment.category,
            proofUrl: payment.proof_url,
          }));

          set({ payments });
        } catch (error) {
          console.error('Error fetching payments:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAnnouncements: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const announcements = data.map((announcement) => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            createdAt: new Date(announcement.created_at),
            authorId: announcement.author_id,
          }));

          set({ announcements });
        } catch (error) {
          console.error('Error fetching announcements:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchGalleryImages: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('uploaded_at', { ascending: false });

          if (error) throw error;

          const galleryImages = data.map((image) => ({
            id: image.id,
            title: image.title,
            imageUrl: image.image_url,
            uploadedAt: new Date(image.uploaded_at),
            authorId: image.author_id,
          }));

          set({ galleryImages });
        } catch (error) {
          console.error('Error fetching gallery images:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAlbums: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('albums')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const albums = data.map((album) => ({
            id: album.id,
            title: album.title,
            coverImageUrl: album.cover_image_url,
            driveUrl: album.drive_url,
            createdAt: new Date(album.created_at),
            authorId: album.author_id,
          }));

          set({ albums });
        } catch (error) {
          console.error('Error fetching albums:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'app-store',
    }
  )
);
