import { User, Payment, Announcement, GalleryImage, Album } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    houseNumber: 'A001',
    name: 'Admin User',
    password_hash: 'admin123', // In real app this would be hashed
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    houseNumber: 'A002',
    name: 'User One',
    password_hash: 'user123', // In real app this would be hashed
    role: 'user',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    houseNumber: 'B001',
    name: 'User Two',
    password_hash: 'user456', // In real app this would be hashed
    role: 'user',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    houseBlock: 'A001',
    paymentDate: new Date('2024-09-01'),
    amount: 150000,
    description: 'Iuran Bulanan September 2024',
    status: 'paid',
    userId: '1',
    type: 'income',
    category: 'Iuran Bulanan',
    proofUrl: 'https://via.placeholder.com/400x300/4ade80/ffffff?text=Bukti+Transfer+Bank'
  },
  {
    id: '2',
    houseBlock: 'A002',
    paymentDate: new Date('2024-09-02'),
    amount: 150000,
    description: 'Iuran Bulanan September 2024',
    status: 'paid',
    userId: '2',
    type: 'income',
    category: 'Iuran Bulanan',
    proofUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Bukti+E-Wallet'
  },
  {
    id: '3',
    houseBlock: 'B001',
    paymentDate: new Date('2024-08-15'),
    amount: 150000,
    description: 'Iuran Bulanan Agustus 2024',
    status: 'paid',
    userId: '3',
    type: 'income',
    category: 'Iuran Bulanan'
  },
  {
    id: '4',
    houseBlock: 'B001',
    paymentDate: new Date(),
    amount: 150000,
    description: 'Iuran Bulanan September 2024',
    status: 'pending',
    userId: '3',
    type: 'income',
    category: 'Iuran Bulanan'
  },
  {
    id: '5',
    houseBlock: 'Admin',
    paymentDate: new Date('2024-09-10'),
    amount: 2500000,
    description: 'Perbaikan lampu jalan dan cat gerbang',
    status: 'paid',
    userId: '1',
    type: 'expense',
    category: 'Pemeliharaan',
    proofUrl: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Kuitansi+Pemeliharaan'
  },
  {
    id: '6',
    houseBlock: 'Admin',
    paymentDate: new Date('2024-09-15'),
    amount: 1200000,
    description: 'Gaji cleaning service bulanan',
    status: 'paid',
    userId: '1',
    type: 'expense',
    category: 'Kebersihan'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Pengumuman Rapat Bulanan',
    content: 'Rapat bulanan akan dilaksanakan pada tanggal 15 September 2024 pukul 19.00 WIB di balai pertemuan.',
    createdAt: new Date('2024-09-01'),
    authorId: '1'
  },
  {
    id: '2',
    title: 'Pemeliharaan Fasilitas Umum',
    content: 'Akan dilakukan pemeliharaan fasilitas umum pada hari Minggu, 10 September 2024. Mohon kerjasamanya.',
    createdAt: new Date('2024-09-05'),
    authorId: '1'
  }
];

export const mockGalleryImages: GalleryImage[] = [
  {
    id: '1',
    title: 'Kegiatan Gotong Royong',
    imageUrl: '/images/gotong-royong.jpg',
    uploadedAt: new Date('2024-08-20'),
    authorId: '1'
  },
  {
    id: '2',
    title: 'Acara 17 Agustus',
    imageUrl: '/images/17-agustus.jpg',
    uploadedAt: new Date('2024-08-17'),
    authorId: '1'
  }
];

export const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'Kegiatan Gotong Royong September 2024',
    coverImageUrl: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Gotong+Royong',
    driveUrl: 'https://drive.google.com/drive/folders/1ABC123...',
    createdAt: new Date('2024-09-01'),
    authorId: '1'
  },
  {
    id: '2',
    title: 'Peringatan HUT RI ke-79',
    coverImageUrl: 'https://via.placeholder.com/400x300/dc2626/ffffff?text=HUT+RI+79',
    driveUrl: 'https://drive.google.com/drive/folders/1DEF456...',
    createdAt: new Date('2024-08-17'),
    authorId: '1'
  },
  {
    id: '3',
    title: 'Arisan Bulanan Agustus 2024',
    coverImageUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Arisan+Bulanan',
    driveUrl: 'https://drive.google.com/drive/folders/1GHI789...',
    createdAt: new Date('2024-08-15'),
    authorId: '1'
  },
  {
    id: '4',
    title: 'Rapat Koordinasi RT/RW',
    coverImageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Rapat+RT%2FRW',
    driveUrl: 'https://drive.google.com/drive/folders/1JKL012...',
    createdAt: new Date('2024-07-20'),
    authorId: '1'
  }
];
