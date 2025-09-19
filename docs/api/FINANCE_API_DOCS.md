# Finance Backend API Documentation

## Overview
Backend API untuk halaman `/finance` yang mencakup pengelolaan data keuangan, upload bukti pembayaran, dan manajemen data warga.

## Database Schema

### Table: financial_records
```sql
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    proof_url TEXT,
    house_block TEXT,
    user_uuid UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket: payment-proofs
Bucket untuk menyimpan file bukti pembayaran dengan akses public untuk viewing.

## API Endpoints

### 1. Financial Records

#### GET `/api/financial-records`
Mendapatkan list data pembayaran dengan filter.

**Query Parameters:**
- `type` (optional): 'income' | 'expense'
- `category` (optional): string
- `month` (optional): '1'-'12'
- `year` (optional): string (e.g., '2024')
- `house_block` (optional): string
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "income",
      "category": "Monthly Fee",
      "amount": 150000,
      "description": "Pembayaran iuran bulanan",
      "date": "2024-09-07",
      "proof_url": "https://...",
      "house_block": "A1",
      "user_uuid": "uuid",
      "created_by": "uuid",
      "created_at": "2024-09-07T10:00:00Z",
      "updated_at": "2024-09-07T10:00:00Z",
      "user": {
        "id": "uuid",
        "nama_lengkap": "John Doe",
        "nomor_rumah": "A1"
      },
      "created_by_user": {
        "id": "uuid",
        "nama_lengkap": "Admin User"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  },
  "summary": {
    "total_income": 5000000,
    "total_expense": 2000000,
    "net_balance": 3000000
  }
}
```

#### POST `/api/financial-records`
Membuat record keuangan baru (input manual).

**Request Body:**
```json
{
  "type": "income",
  "category": "Monthly Fee",
  "amount": 150000,
  "description": "Pembayaran iuran bulanan",
  "date": "2024-09-07",
  "house_block": "A1",
  "user_uuid": "uuid",
  "proof_url": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "income",
  // ... other fields
}
```

#### GET `/api/financial-records/[id]`
Mendapatkan detail single record.

#### PUT `/api/financial-records/[id]`
Update record keuangan.

#### DELETE `/api/financial-records/[id]`
Hapus record keuangan.

### 2. Upload Bukti Pembayaran

#### POST `/api/upload-proof`
Upload file bukti pembayaran ke Supabase Storage.

**Request:** FormData
- `file`: File (JPEG, PNG, PDF max 5MB)

**Response:**
```json
{
  "message": "File uploaded successfully",
  "fileName": "payment_proof_1694087234567_abc123.jpg",
  "url": "https://supabase.co/storage/v1/object/public/payment-proofs/...",
  "size": 1024000,
  "type": "image/jpeg"
}
```

#### DELETE `/api/upload-proof?fileName=filename`
Hapus file bukti pembayaran.

### 3. House Blocks & Users

#### GET `/api/house-blocks`
Mendapatkan data blok rumah dan warga untuk dropdown.

**Query Parameters:**
- `type` (optional): 'blocks' | 'users' | 'all' (default: 'all')

**Response:**
```json
{
  "blocks": [
    {
      "value": "A1",
      "label": "Blok A1"
    }
  ],
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "house_block": "A1",
      "value": "uuid",
      "label": "John Doe - Blok A1"
    }
  ]
}
```

### 4. Health Check

#### GET `/api/finance/health`
Check status API endpoints.

## Authentication
Semua endpoint memerlukan authentication sebagai admin:
- Cookie: `session_token`
- Role: `admin`

## Usage Example with Custom Hook

```typescript
import { useFinancialRecords, useHouseBlocks } from '@/hooks/use-financial-records';

function FinancePage() {
  const {
    records,
    summary,
    pagination,
    loading,
    error,
    fetchRecords,
    createRecord,
    uploadProof
  } = useFinancialRecords();

  const { blocks, users } = useHouseBlocks();

  useEffect(() => {
    fetchRecords({ type: 'income', month: '9', year: '2024' });
  }, []);

  const handleCreateRecord = async (data) => {
    const record = await createRecord(data);
    if (record) {
      console.log('Record created:', record);
    }
  };

  const handleUploadProof = async (file) => {
    const result = await uploadProof(file);
    if (result) {
      console.log('File uploaded:', result.url);
    }
  };

  // ... render component
}
```

## Setup Instructions

1. **Database Migration:** Jalankan SQL dari `supabase/migrations/20250907120000_create_financial_records_table.sql`

2. **Storage Setup:** Jalankan SQL dari `setup-storage.sql` untuk membuat bucket dan policies

3. **Environment Variables:** Pastikan sudah ada:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Test API:** Akses `/api/finance/health` untuk memastikan semua endpoint tersedia

## Features Completed

✅ **Get list data pembayaran** - dengan filtering dan pagination  
✅ **Create input manual** - dengan validasi lengkap  
✅ **Upload bukti pembayaran** - via Supabase Storage  
✅ **Dropdown blok rumah** - data dari tabel users  
✅ **Authentication** - menggunakan custom auth system  
✅ **Custom hooks** - untuk mudah digunakan di frontend  

## Error Handling
- Input validation dengan Zod
- Proper HTTP status codes
- Descriptive error messages
- Authentication checks
- File type dan size validation

## Security
- Admin-only access untuk semua endpoints
- File upload restrictions (type & size)
- SQL injection protection via Supabase
- Session-based authentication
