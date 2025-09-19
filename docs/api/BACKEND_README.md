# GJL Frontend - Backend Implementation

Backend sistem manajemen perumahan dengan integrasi Supabase, NextAuth, dan Zustand.

## 🏗️ Arsitektur Backend

### 1. Database (Supabase)
- **PostgreSQL database** dengan Row Level Security (RLS)
- **Real-time subscriptions** untuk update data langsung
- **File storage** untuk gambar dan dokumen
- **Auto-generated API** dengan PostgREST

### 2. Authentication (NextAuth.js)
- **Credential-based authentication** dengan house number dan password
- **JWT session management**
- **Role-based access control** (admin/user)
- **Secure password hashing** dengan bcryptjs

### 3. State Management (Zustand)
- **Client-side state** untuk data caching
- **Persistent storage** dengan localStorage
- **Optimistic updates** untuk UX yang responsif
- **Centralized store** untuk users, payments, announcements, dll

## 📊 Database Schema

### Tabel Utama

#### profiles
```sql
- id (UUID, PK) - References auth.users
- house_number (VARCHAR, UNIQUE)
- role (ENUM: admin/user)  
- full_name (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

#### payments
```sql
- id (UUID, PK)
- house_block (VARCHAR)
- payment_date (TIMESTAMP)
- amount (DECIMAL)
- description (TEXT)
- status (ENUM: paid/pending)
- user_id (UUID, FK)
- type (ENUM: income/expense)
- category (VARCHAR)
- proof_url (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

#### announcements
```sql
- id (UUID, PK)
- title (VARCHAR)
- content (TEXT)
- author_id (UUID, FK)
- is_published (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### gallery_images
```sql
- id (UUID, PK)
- title (VARCHAR)
- image_url (VARCHAR)
- author_id (UUID, FK)
- album_id (UUID, FK, NULLABLE)
- uploaded_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### albums
```sql
- id (UUID, PK)
- title (VARCHAR)
- description (TEXT)
- cover_image_url (VARCHAR)
- drive_url (VARCHAR)
- author_id (UUID, FK)
- created_at, updated_at (TIMESTAMP)
```

## 🔐 Security Features

### Row Level Security (RLS)
- **User data isolation** - Users can only access their own data
- **Admin privileges** - Admins can access all data
- **Public content** - Announcements and gallery visible to all authenticated users

### Authentication Security
- **Bcrypt password hashing** dengan salt rounds 12
- **JWT tokens** untuk session management
- **Secure HTTP-only cookies** (NextAuth default)
- **CSRF protection** built-in dengan NextAuth

### API Security
- **Server-side authentication** checks pada semua API routes
- **Role-based authorization** untuk admin functions
- **Input validation** dengan Zod schemas
- **Error handling** tanpa expose sensitive data

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js @auth/supabase-adapter zustand @types/bcryptjs bcryptjs
```

### 2. Environment Configuration
Buat file `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### 3. Database Setup
```bash
# Run setup script
./setup-database.sh

# Or manual setup:
# 1. Execute supabase/migrations/20250906000001_initial_schema.sql
# 2. Execute supabase/migrations/20250906000002_seed_data.sql
```

### 4. Create Admin User
Di Supabase Dashboard > Authentication:
```json
{
  "email": "admin@gjl.local",
  "user_metadata": {
    "house_number": "A-01",
    "role": "admin", 
    "full_name": "Administrator",
    "password": "[HASHED_PASSWORD]"
  }
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login dengan credentials
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Users Management  
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (admin only)

### Data Access
Semua data access melalui Supabase client dengan RLS policies:
```typescript
// Example: Fetch payments for current user
const { data: payments } = await supabase
  .from('payments')
  .select('*')
  .order('payment_date', { ascending: false });
```

## 🎯 Usage Examples

### Authentication Hook
```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome {user.houseNumber}!</div>;
}
```

### Users Management Hook
```typescript
import { useUsers } from '@/hooks/use-users';

function AdminPanel() {
  const { users, createUser, updateUser, deleteUser } = useUsers();
  
  const handleCreateUser = async () => {
    await createUser({
      houseNumber: 'B-02',
      password: 'secure123',
      fullName: 'John Doe',
      role: 'user'
    });
  };
}
```

### Zustand Store Usage
```typescript
import { useAppStore } from '@/store/app-store';

function PaymentsList() {
  const { payments, fetchPayments } = useAppStore();
  
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  return (
    <div>
      {payments.map(payment => (
        <div key={payment.id}>{payment.description}</div>
      ))}
    </div>
  );
}
```

## 🛠️ Development Tools

### Password Hashing Utility
```bash
# Generate hashed password for manual user creation
npx tsx src/lib/password.ts admin123
```

### Database Migration
```bash
# Apply migrations with Supabase CLI
supabase db push

# Reset database (development only)
supabase db reset
```

## 📈 Next Steps

### Phase 2 Features
1. **Real-time notifications** dengan Supabase subscriptions
2. **File upload** untuk payment proofs dan gallery images  
3. **Email notifications** untuk announcements
4. **Mobile app** dengan React Native
5. **Advanced reporting** dan analytics

### Performance Optimizations
1. **Data caching** dengan React Query atau SWR
2. **Image optimization** dengan Next.js Image
3. **Database indexing** untuk query performance
4. **CDN integration** untuk static assets

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`) 
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.
