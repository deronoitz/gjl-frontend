# Laporan Pembayaran Iuran - Admin Feature

## Overview
Fitur admin untuk melihat dan mengelola status pembayaran iuran bulanan seluruh warga dalam bentuk tabel yang mudah dibaca.

## Features

### 📊 Dashboard Overview
- **Total Warga**: Jumlah total pengguna terdaftar
- **Total Pembayaran**: Jumlah pembayaran yang sudah tercatat
- **Persentase Bayar**: Tingkat kepatuhan pembayaran
- **Terpilih**: Jumlah warga yang dipilih untuk aksi massal

### 📅 Filter Tahun
- Pilih tahun untuk melihat data pembayaran
- Default: tahun berjalan
- Range: 2023-2026 (dapat diperluas)

### 📋 Tabel Laporan
#### Kolom Tabel:
- **Checkbox**: Untuk memilih warga (aksi massal)
- **No. Rumah**: Nomor rumah warga
- **Nama**: Nama lengkap warga
- **Jan-Des**: Status pembayaran per bulan (✓ atau ✗)
- **Total**: Jumlah bulan yang sudah dibayar (x/12)
- **Status**: Badge status pembayaran
  - 🟢 **Baik**: ≥10 bulan
  - 🟡 **Cukup**: 6-9 bulan  
  - 🔴 **Kurang**: <6 bulan

### 🔧 Aksi Massal
- **Select All**: Pilih/batalkan semua warga
- **Tambah Pembayaran per Bulan**: Tombol untuk setiap bulan
- Menambahkan record pembayaran untuk warga yang dipilih

### 📤 Export Data
- **Export CSV**: Download laporan dalam format CSV
- Format: `laporan-pembayaran-{tahun}.csv`
- Include semua data tabel dengan status

## Navigation
**Path**: `/admin/payment-report`
**Menu**: "Laporan Iuran" (Admin only)

## Technical Implementation

### Components Used
- **Table**: Responsive table dengan scroll horizontal
- **Checkbox**: Multi-select untuk aksi massal  
- **Badge**: Visual status indicator
- **Select**: Year filter dropdown
- **Card**: Layout structure

### Data Sources
- **Users**: Dari tabel `users` (Supabase)
- **Payment Records**: Dari tabel `payment_records` (Supabase)
- **API**: `/api/payment-status` endpoints

### Hooks Used
- `usePaymentStatus`: CRUD operations payment records
- `useAuth`: Authentication & authorization
- `useState/useEffect`: Local state management

## Security
- **Admin Only**: Hanya admin yang dapat mengakses halaman ini
- **Row Level Security**: Database-level access control
- **Authentication Required**: Semua API calls memerlukan auth

## Performance Features
- **Lazy Loading**: Data dimuat sesuai kebutuhan
- **Memoization**: Optimized re-renders
- **Indexed Queries**: Fast database lookups
- **Responsive Design**: Mobile-friendly layout

## Usage Instructions

### Untuk Admin:
1. Login sebagai admin
2. Navigate ke "Laporan Iuran" di menu
3. Pilih tahun yang diinginkan
4. Review status pembayaran warga
5. Gunakan checkbox untuk memilih warga
6. Klik tombol bulan untuk menambah pembayaran massal
7. Export data jika diperlukan

### Bulk Payment Process:
1. ✅ Pilih warga (checkbox)
2. ✅ Klik tombol bulan (misal: "+ Januari")
3. ✅ Konfirmasi aksi
4. ✅ Data otomatis terupdate
5. ✅ Visual indicator berubah

## Future Enhancements
- 📧 Email notifications untuk warga
- 📊 Advanced analytics & charts
- 🔄 Auto-sync dengan sistem pembayaran
- 📱 Mobile app integration
- 🖨️ Print-friendly reports

---

**Status**: ✅ Production Ready
**Created**: September 2025
**Last Updated**: September 2025
