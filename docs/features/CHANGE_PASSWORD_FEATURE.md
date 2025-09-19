# Fitur Change Password

Fitur ini memungkinkan user normal untuk mengganti password mereka sendiri melalui UI yang user-friendly.

## Komponen yang Ditambahkan

### 1. API Endpoint: `/api/auth/change-password`
- **Method**: POST
- **Authentication**: Membutuhkan session token yang valid
- **Request Body**:
  ```json
  {
    "currentPassword": "password_lama",
    "newPassword": "password_baru"
  }
  ```
- **Validasi**:
  - Password lama harus valid
  - Password baru minimal 6 karakter
  - Hanya user yang sedang login yang bisa mengganti password mereka sendiri

### 2. AuthContext Enhancement
- Menambahkan fungsi `changePassword()` ke AuthContext
- Interface: `changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>`

### 3. ChangePasswordDialog Component
- Modal dialog untuk form change password
- Fitur yang tersedia:
  - Field password lama dengan validasi
  - Field password baru dengan validasi minimal 6 karakter
  - Field konfirmasi password baru
  - Toggle show/hide untuk semua field password
  - Loading state saat proses
  - Success/error notifications
  - Auto-close setelah berhasil

### 4. Navigation Enhancement
- Menambahkan menu "Ganti Password" ke dropdown user
- Menu ini tersedia untuk semua user (tidak hanya admin)
- Menggunakan icon Lock dari Lucide

## Cara Menggunakan

1. User login ke aplikasi
2. Klik avatar user di navigation bar (pojok kanan atas)
3. Pilih menu "Ganti Password"
4. Isi form dengan:
   - Password lama (current password)
   - Password baru (minimal 6 karakter)
   - Konfirmasi password baru
5. Klik "Ganti Password"
6. Sistem akan:
   - Memverifikasi password lama
   - Memvalidasi password baru
   - Update database dengan password baru yang ter-hash
   - Menampilkan notifikasi sukses/error

## Security Features

- Password di-hash menggunakan bcrypt dengan salt rounds 12
- Verifikasi password lama sebelum update
- Session-based authentication untuk authorization
- Input validation di frontend dan backend
- Error handling yang aman tanpa expose sensitive info

## File yang Dimodifikasi/Ditambahkan

1. `src/app/api/auth/change-password/route.ts` - API endpoint baru
2. `src/contexts/AuthContext.tsx` - Menambahkan changePassword function
3. `src/hooks/use-custom-auth.ts` - Implementasi changePassword hook
4. `src/components/ChangePasswordDialog.tsx` - Modal component baru
5. `src/components/Navigation.tsx` - Menambahkan menu change password
