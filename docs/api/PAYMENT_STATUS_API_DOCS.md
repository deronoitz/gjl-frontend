# Payment Status Backend Documentation

## Overview
Backend untuk Status Pembayaran Iuran yang memungkinkan admin untuk melacak dan mengelola pembayaran bulanan member. Semua yang tercatat dalam tabel ini adalah pembayaran yang sudah berhasil/sukses.

## Database Schema

### Table: `payment_records`
```sql
CREATE TABLE payment_records (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
    tahun INTEGER NOT NULL CHECK (tahun >= 2024),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_uuid, bulan, tahun)
);
```

### Fields Description:
- `id`: ID unik untuk setiap record pembayaran
- `user_uuid`: UUID dari user yang melakukan pembayaran (FK ke tabel users)
- `bulan`: Bulan pembayaran (1-12)
- `tahun`: Tahun pembayaran (>=2024)
- `created_by`: UUID admin yang menambahkan record ini (FK ke tabel users)
- `created_at`: Timestamp kapan record dibuat

## API Endpoints

### 1. GET /api/payment-status
**Description:** Mengambil data payment records dengan filter opsional

**Query Parameters:**
- `userId` (optional): Filter berdasarkan user UUID
- `bulan` (optional): Filter berdasarkan bulan (1-12)
- `tahun` (optional): Filter berdasarkan tahun

**Authorization:** 
- Admin: dapat melihat semua data
- User: hanya dapat melihat data mereka sendiri

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_uuid": "uuid-here",
      "bulan": 9,
      "tahun": 2025,
      "created_at": "2025-09-06T12:00:00Z",
      "created_by": "admin-uuid",
      "users": {
        "name": "John Doe"
      },
      "created_by_user": {
        "name": "Admin User"
      }
    }
  ]
}
```

### 2. POST /api/payment-status
**Description:** Membuat record payment baru

**Authorization:** Admin only

**Request Body:**
```json
{
  "user_uuid": "uuid-here",
  "bulan": 9,
  "tahun": 2025
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "user_uuid": "uuid-here",
    "bulan": 9,
    "tahun": 2025,
    "created_at": "2025-09-06T12:00:00Z",
    "created_by": "admin-uuid",
    "users": {
      "name": "John Doe"
    }
  }
}
```

### 3. DELETE /api/payment-status
**Description:** Menghapus record payment

**Authorization:** Admin only

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "message": "Payment status deleted successfully"
}
```

### 4. POST /api/payment-status/bulk
**Description:** Membuat multiple payment records sekaligus

**Authorization:** Admin only

**Request Body:**
```json
{
  "user_uuids": ["uuid1", "uuid2", "uuid3"],
  "bulan": 9,
  "tahun": 2025
}
```

**Response:**
```json
{
  "data": [...], // Array of created records
  "message": "Successfully created 3 payment status records"
}
```

### 5. GET /api/payment-status/statistics
**Description:** Mendapatkan statistik pembayaran untuk bulan/tahun tertentu

**Authorization:** Admin only

**Query Parameters:**
- `bulan` (required): Bulan (1-12)
- `tahun` (required): Tahun

**Response:**
```json
{
  "data": {
    "totalUsers": 100,
    "paidUsers": 85,
    "unpaidUsers": 15,
    "paymentPercentage": 85,
    "unpaidUsersList": [
      {
        "id": "uuid",
        "name": "User Name",
        "house_number": "A123"
      }
    ],
    "recentPayments": [...], // 10 most recent payments
    "month": 9,
    "year": 2025
  }
}
```

## React Hooks

### usePaymentStatus
```typescript
const {
  paymentData,
  loading,
  error,
  fetchPaymentStatus,
  createPaymentStatus,
  createBulkPaymentStatus,
  deletePaymentStatus
} = usePaymentStatus();
```

### usePaymentStatistics
```typescript
const {
  statistics,
  loading,
  error,
  fetchStatistics
} = usePaymentStatistics();
```

## Security Features

1. **Row Level Security (RLS):**
   - Admin dapat melihat dan mengelola semua data
   - User hanya dapat melihat data mereka sendiri

2. **Input Validation:**
   - Validasi bulan (1-12) dan tahun (>=2024)
   - Unique constraint untuk mencegah duplikasi

3. **Authentication:**
   - Semua endpoint memerlukan session token yang valid
   - Admin authorization untuk operasi management

## Usage Example

```typescript
// Fetch payment records for current month
await fetchPaymentStatus({
  bulan: 9,
  tahun: 2025
});

// Create single payment record
await createPaymentStatus({
  user_uuid: "user-uuid",
  bulan: 9,
  tahun: 2025
});

// Create bulk payment records
await createBulkPaymentStatus({
  user_uuids: ["uuid1", "uuid2"],
  bulan: 9,
  tahun: 2025
});

// Get statistics
await fetchStatistics(9, 2025);
```

## Database Migration Status
✅ Migration file: `20250906171500_create_payment_records_table.sql`
✅ Successfully applied to Supabase Cloud
✅ Table name: `payment_records` (renamed from `payment_status` to avoid enum conflict)

## Important Notes
- Tabel ini hanya menyimpan record pembayaran yang sukses
- Setiap kombinasi user_uuid + bulan + tahun hanya bisa ada satu record (unique constraint)
- Admin dapat melihat siapa yang menambahkan record melalui field `created_by`
- Data user yang belum bayar dapat dilihat melalui API statistics (unpaidUsersList)
- Nama tabel diubah dari `payment_status` menjadi `payment_records` untuk menghindari konflik dengan enum type yang sudah ada
