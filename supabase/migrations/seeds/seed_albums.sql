-- Seed data untuk testing albums
-- Jalankan manual setelah migration

-- Insert sample albums (pastikan user dengan ID ini ada di tabel users)
INSERT INTO albums (title, drive_url, cover_image_url, author_id) VALUES
(
  'Album Test Kegiatan Gotong Royong', 
  'https://drive.google.com/drive/folders/1234567890test',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
),
(
  'Album Test Olahraga Pagi', 
  'https://drive.google.com/drive/folders/abcdefghijtest',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);
