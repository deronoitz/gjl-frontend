# Fitur Daftar Warga

## Deskripsi
Halaman baru yang memungkinkan semua user yang sudah login (baik admin maupun user biasa) untuk melihat daftar warga perumahan. Halaman ini menampilkan informasi publik dari warga tanpa informasi sensitif seperti password.

## Fitur

### 1. Akses
- **URL**: `/warga`
- **Akses**: Semua user yang sudah login (admin dan user biasa)
- **Authentication**: Menggunakan ProtectedRoute untuk memastikan hanya user yang login yang bisa akses

### 2. Data yang Ditampilkan
- Nama lengkap warga
- Nomor rumah
- Nomor telepon (jika ada)
- Jabatan/posisi dalam organisasi (jika ada)

### 3. Fitur Pencarian & Filter
- **Pencarian**: Berdasarkan nama, nomor rumah, atau nomor telepon
- **Sorting**: 
  - Nomor rumah (default)
  - Nama (A-Z)
  - Jabatan
- **Filter Jabatan**:
  - Semua jabatan
  - Tanpa jabatan
  - Per jabatan tertentu

### 4. Tampilan
- **Responsive**: Grid yang menyesuaikan dengan ukuran layar
- **Card-based**: Setiap warga ditampilkan dalam card terpisah
- **Interactive**: Hover effects dan nomor telepon yang bisa diklik
- **Empty states**: Pesan ketika tidak ada data atau tidak ada hasil pencarian

## File yang Dibuat/Dimodifikasi

### 1. API Endpoint
- **File**: `src/app/api/warga/route.ts`
- **Method**: GET
- **Authentication**: Memerlukan session token
- **Return**: Array of residents (tanpa password atau data sensitif)

### 2. React Hook
- **File**: `src/hooks/use-residents.ts`
- **Export**: `useResidents()` hook
- **Features**: 
  - Fetch data residents
  - Loading state
  - Error handling
  - Refetch function

### 3. Halaman Warga
- **File**: `src/app/warga/page.tsx`
- **Component**: `WargaPage`
- **Features**:
  - Protected route
  - Search functionality
  - Sort and filter
  - Responsive grid layout
  - Empty states

### 4. Navigation Update
- **File**: `src/components/Navigation.tsx`
- **Changes**: 
  - Menambahkan menu "Daftar Warga" di submenu "Warga" untuk user biasa
  - Menambahkan menu "Daftar Warga" dan "Kelola Warga" untuk admin

## Struktur Database
Menggunakan tabel `users` yang sudah ada dengan join ke tabel `positions`:

```sql
SELECT 
  id, 
  house_number, 
  name, 
  phone_number,
  positions.id,
  positions.position,
  positions.order
FROM users 
LEFT JOIN positions ON users.position_id = positions.id
ORDER BY house_number ASC
```

## Security
- Endpoint `/api/warga` hanya mengembalikan data publik
- Password hash dan data sensitif lainnya tidak disertakan
- Memerlukan authentication untuk akses
- Tidak ada operasi write (hanya read-only)

## Testing
1. Login sebagai user biasa atau admin
2. Akses menu "Warga" → "Daftar Warga"
3. Test fitur pencarian dengan nama/nomor rumah/telepon
4. Test sorting berdasarkan nama, nomor rumah, jabatan
5. Test filter berdasarkan jabatan
6. Verifikasi responsive design di berbagai ukuran layar

## Penggunaan
```typescript
// Menggunakan hook
const { residents, loading, error, refetch } = useResidents();

// Mengakses API langsung
const response = await fetch('/api/warga');
const residents = await response.json();
```
