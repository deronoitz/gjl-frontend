# Fitur Pengaturan Nilai Iuran Bulanan

Fitur ini memungkinkan admin untuk mengatur dan menyimpan nilai iuran bulanan yang akan ditampilkan ke semua user. Data disimpan secara persistent di database.

## Komponen yang Ditambahkan

### 1. Database Migration: `20250906120005_create_app_settings.sql`
- Membuat tabel `app_settings` untuk menyimpan pengaturan aplikasi
- Menyimpan data dalam format JSON untuk fleksibilitas
- Termasuk RLS policies untuk keamanan (hanya admin yang bisa edit)
- Default data untuk `monthly_fee`, `app_name`, dan `contact_info`

**Struktur tabel:**
```sql
app_settings (
    id UUID PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 2. API Endpoint: `/api/settings`
- **GET**: Mengambil semua pengaturan (admin) atau pengaturan publik (user biasa)
- **PUT**: Update pengaturan (hanya admin)
- Validasi untuk memastikan format data yang benar
- Error handling yang komprehensif

**Format data monthly_fee:**
```json
{
  "monthly_fee": {
    "amount": 150000,
    "currency": "IDR"
  }
}
```

### 3. useSettings Hook (`src/hooks/use-settings.ts`)
- Custom hook untuk mengelola state settings
- Auto-fetch data saat component mount
- Fungsi `updateSettings()` untuk admin
- Merge dengan default settings jika API gagal
- Loading dan error states

**Interface:**
```typescript
interface AppSettings {
  monthly_fee: {
    amount: number;
    currency: string;
  };
  app_name: string;
  contact_info?: {
    phone: string;
    email: string;
    address: string;
  };
}
```

### 4. Enhanced Admin Settings Page
- Upgrade dari localStorage ke database
- Real-time sync antara local state dan database
- Loading skeletons saat mengambil data
- Improved UX dengan loading states dan error handling
- Validasi input dengan format mata uang Indonesia
- Perbandingan antara nilai lokal dan database

**Fitur yang tersedia:**
- Edit iuran bulanan dengan format rupiah
- Reset ke nilai default
- Real-time validation
- Auto-save indicators
- Error/success notifications

### 5. MonthlyFeeCard Component
- Card component untuk menampilkan nilai iuran bulanan
- Format mata uang Indonesia (Rp xxx.xxx)
- Loading skeleton saat data dimuat
- Dapat digunakan di berbagai halaman

### 6. Dashboard Integration
- MonthlyFeeCard ditampilkan di dashboard user
- User biasa dapat melihat nilai iuran bulanan terkini
- Responsive grid layout

## Security & Permissions

### Admin Permissions:
- View semua settings
- Edit semua settings
- Delete settings (melalui database)

### User Permissions:
- View settings publik (`monthly_fee`, `app_name`)
- Tidak dapat edit settings

### Database Security:
- Row Level Security (RLS) enabled
- Policies hanya allow admin untuk INSERT/UPDATE/DELETE
- User biasa hanya bisa SELECT data publik

## Cara Menggunakan

### Untuk Admin:
1. Login sebagai admin
2. Buka halaman "Settings" dari navigation
3. Edit nilai "Iuran Bulanan (Rp)"
4. Klik "Simpan Perubahan"
5. Nilai akan tersimpan di database dan langsung terlihat di semua user

### Untuk User Biasa:
1. Login ke aplikasi
2. Di dashboard, lihat card "Iuran Bulanan"
3. Nilai akan otomatis ter-update sesuai pengaturan admin

## File yang Dimodifikasi/Ditambahkan

1. `supabase/migrations/20250906120005_create_app_settings.sql` - Database schema
2. `src/app/api/settings/route.ts` - API endpoint
3. `src/hooks/use-settings.ts` - Custom hook
4. `src/app/admin/settings/page.tsx` - Enhanced admin page
5. `src/components/MonthlyFeeCard.tsx` - Display component
6. `src/app/dashboard/page.tsx` - Dashboard integration

## Pengembangan Selanjutnya

Fitur ini dapat diperluas untuk:
- Setting kontak perumahan
- Setting biaya lain (denda, sewa fasilitas, dll)
- Setting notifikasi
- Setting tema/branding
- Backup/restore settings
