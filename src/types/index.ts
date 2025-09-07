export interface User {
  id: string;
  houseNumber: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  houseNumber: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  id: string;
  houseBlock: string;
  paymentDate: Date;
  amount: number;
  description: string;
  status: 'paid' | 'pending';
  userId: string;
  type: 'income' | 'expense';
  category: string;
  proofUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  uploadedAt: Date;
  authorId: string;
}

export interface Album {
  id: string;
  title: string;
  coverImageUrl: string;
  driveUrl: string;
  createdAt: Date;
  authorId: string;
  authorName?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  proofUrl?: string;
  houseBlock?: string;
  createdBy: string;
  createdAt: Date;
}
