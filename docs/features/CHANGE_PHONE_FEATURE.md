# Fitur Ganti Nomor Handphone

## Deskripsi
Fitur ini memungkinkan semua user (baik admin maupun user biasa) untuk mengganti nomor handphone mereka sendiri melalui menu navigasi.

## Lokasi Menu
Menu "Ganti Nomor HP" dapat diakses melalui:
- **Desktop**: Dropdown profil di kanan atas → "Ganti Nomor HP" 
- **Mobile**: Menu hamburger → "Ganti Nomor HP"

Menu ini ditempatkan tepat di bawah menu "Ganti Password" sesuai permintaan.

## Fitur Utama

### 1. Validasi Format Nomor
- Mendukung format: 08123456789, 62812345678, +62812345678
- Nomor akan dinormalisasi ke format 62xxxxxxxxx di database
- Validasi menggunakan regex untuk nomor handphone Indonesia

### 2. Validasi Duplikasi
- Sistem mengecek apakah nomor sudah digunakan user lain
- Menampilkan error jika nomor sudah terdaftar

### 3. Pre-fill Nomor Saat Ini
- Jika user sudah memiliki nomor, akan ditampilkan sebagai referensi
- Form akan diisi dengan nomor saat ini (dikonversi ke format 0812...)

### 4. Update Real-time
- Setelah berhasil update, data user di aplikasi langsung terupdate
- Tidak perlu refresh atau login ulang

## File yang Dibuat/Dimodifikasi

### 1. API Endpoint Baru
```
/src/app/api/auth/change-phone/route.ts
```
- Endpoint POST untuk mengubah nomor handphone
- Validasi format dan duplikasi
- Normalisasi nomor ke format Indonesia

### 2. Komponen Dialog Baru
```
/src/components/ChangePhoneDialog.tsx
```
- Dialog modal untuk form ganti nomor
- Validasi client-side
- UI yang konsisten dengan ChangePasswordDialog

### 3. Update AuthContext
```
/src/contexts/CustomAuthContext.tsx
/src/hooks/use-custom-auth.ts
/src/lib/custom-auth.ts
```
- Tambah method `changePhoneNumber` 
- Update interface AuthUser dengan field phoneNumber
- Update mapping database untuk include phone_number

### 4. Update Navigation
```
/src/components/Navigation.tsx
```
- Tambah menu "Ganti Nomor HP" di dropdown desktop
- Tambah menu "Ganti Nomor HP" di mobile menu
- Import dan integrasi ChangePhoneDialog

## Format Data

### Database
- Field: `phone_number` (string)
- Format tersimpan: `62812345678` (tanpa +, spasi, atau karakter khusus)

### Display
- Format ditampilkan: `+62 812 345 678` (dengan formatting untuk readability)

## Keamanan
- Hanya user yang login yang bisa mengakses
- User hanya bisa mengubah nomor handphone sendiri
- Validasi session token pada setiap request

## Error Handling
- Format nomor tidak valid
- Nomor sudah digunakan user lain
- Error koneksi database
- Session expired

## Testing
Fitur ini sudah ditest untuk:
- ✅ TypeScript compilation
- ✅ Linting
- ✅ Development server startup
- 🔄 Manual testing via browser (available at localhost:3001)

## Cara Penggunaan
1. Login ke aplikasi
2. Klik dropdown profil (desktop) atau menu hamburger (mobile)
3. Pilih "Ganti Nomor HP"
4. Masukkan nomor handphone baru
5. Klik "Ganti Nomor"
6. Nomor handphone berhasil diperbarui
