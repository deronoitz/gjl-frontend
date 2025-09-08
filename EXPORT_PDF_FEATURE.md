# Fitur Export PDF untuk Laporan Keuangan

## Deskripsi
Fitur export PDF memungkinkan pengguna untuk mengunduh laporan keuangan dalam format PDF berdasarkan filter yang diterapkan.

## Fitur

### 1. Tombol Export PDF
- Tombol "Export PDF" tersedia di bagian header halaman finance
- Tombol akan disabled jika tidak ada data atau sedang dalam proses export
- Menampilkan loading indicator saat proses export

### 2. Filter yang Mendukung Export
Export PDF akan mengikuti filter yang sedang aktif:
- **Filter Bulan**: Export sesuai bulan yang dipilih
- **Filter Tahun**: Export sesuai tahun yang dipilih  
- **Filter Tipe**: Export sesuai tipe transaksi (Pemasukan/Pengeluaran)

### 3. Isi Laporan PDF

#### Header Laporan
- Judul "LAPORAN KEUANGAN PERUMAHAN GJL"
- Informasi filter yang diterapkan
- Tanggal pembuatan laporan

#### Ringkasan Keuangan
Tabel ringkasan berisi:
- Total Pemasukan
- Total Pengeluaran  
- Saldo Bersih

#### Detail Transaksi
Tabel detail transaksi dengan kolom:
- Blok Rumah
- Tipe (Pemasukan/Pengeluaran)
- Kategori
- Tanggal
- Nominal
- Keterangan
- Created By

#### Footer
- Nomor halaman

### 4. Nama File
Format nama file yang diunduh:
- `laporan-keuangan-YYYY-MM-DD-HHMM.pdf` (untuk semua data)
- `laporan-keuangan-YYYY-MM-DD-HHMM-januari-2024.pdf` (dengan filter bulan/tahun)
- `laporan-keuangan-YYYY-MM-DD-HHMM-income.pdf` (dengan filter tipe)

## Teknologi yang Digunakan

### Dependencies
- **jsPDF**: Library untuk membuat file PDF
- **jsPDF-AutoTable**: Plugin untuk membuat tabel di PDF

### File yang Ditambahkan/Dimodifikasi
1. **`/src/lib/pdf-export.ts`** - Utility function untuk generate PDF
2. **`/src/app/finance/page.tsx`** - Menambah tombol export dan logic

### Key Features
- **Responsive Design**: Tombol export menyesuaikan dengan ukuran layar
- **Error Handling**: Menampilkan pesan error jika export gagal
- **Loading State**: Loading indicator selama proses export
- **Automatic Filename**: Nama file otomatis sesuai filter dan timestamp

## Cara Penggunaan

1. Buka halaman **Finance/Laporan Keuangan**
2. Atur filter sesuai kebutuhan (Bulan, Tahun, Tipe)
3. Klik tombol **"Export PDF"**
4. File PDF akan otomatis diunduh ke perangkat
5. Pesan sukses akan ditampilkan setelah export berhasil

## Error Handling

### Kondisi Error
- Tidak ada data untuk di export
- Gagal membuat file PDF
- Error saat proses export

### User Feedback
- Alert message untuk status error/success
- Loading indicator selama proses
- Tombol disabled saat tidak ada data

## Future Improvements
- Export Excel/CSV format
- Customizable PDF template
- Email export functionality
- Batch export multiple periods
