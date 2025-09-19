# Gallery Backend API Documentation

## Overview
Backend API untuk fitur gallery album foto menggunakan Supabase database dan storage.

## Database Schema

### Albums Table
```sql
CREATE TABLE albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    cover_image_url TEXT,
    drive_url TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Storage Bucket
- Bucket ID: `album-covers`
- Public access: Yes
- Untuk menyimpan gambar cover album

## API Endpoints

### GET /api/albums
Mengambil semua album dengan informasi author.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Judul Album",
    "cover_image_url": "https://supabase.co/storage/album-covers/image.jpg",
    "drive_url": "https://drive.google.com/...",
    "created_at": "2025-09-06T12:00:00Z",
    "updated_at": "2025-09-06T12:00:00Z",
    "author_id": "uuid",
    "users": {
      "name": "Nama Author"
    }
  }
]
```

### POST /api/albums
Membuat album baru dengan upload cover image.

**Request:** FormData
- `title`: string (required) - Judul album
- `driveUrl`: string (required) - URL Google Drive folder
- `authorId`: string (required) - ID user yang membuat album
- `coverImage`: File (optional) - File gambar cover

**Response:** 201 Created
```json
{
  "id": "uuid",
  "title": "Judul Album",
  "cover_image_url": "https://supabase.co/storage/album-covers/image.jpg",
  "drive_url": "https://drive.google.com/...",
  "created_at": "2025-09-06T12:00:00Z",
  "updated_at": "2025-09-06T12:00:00Z",
  "author_id": "uuid",
  "users": {
    "name": "Nama Author"
  }
}
```

### GET /api/albums/[id]
Mengambil album berdasarkan ID.

**Response:**
```json
{
  "id": "uuid",
  "title": "Judul Album",
  "cover_image_url": "https://supabase.co/storage/album-covers/image.jpg",
  "drive_url": "https://drive.google.com/...",
  "created_at": "2025-09-06T12:00:00Z",
  "updated_at": "2025-09-06T12:00:00Z",
  "author_id": "uuid",
  "users": {
    "name": "Nama Author"
  }
}
```

### PUT /api/albums/[id]
Update album existing, dengan opsi upload cover image baru.

**Request:** FormData
- `title`: string (required) - Judul album
- `driveUrl`: string (required) - URL Google Drive folder
- `coverImage`: File (optional) - File gambar cover baru

**Response:** 200 OK
```json
{
  "id": "uuid",
  "title": "Judul Album Updated",
  "cover_image_url": "https://supabase.co/storage/album-covers/new-image.jpg",
  "drive_url": "https://drive.google.com/...",
  "created_at": "2025-09-06T12:00:00Z",
  "updated_at": "2025-09-06T12:05:00Z",
  "author_id": "uuid",
  "users": {
    "name": "Nama Author"
  }
}
```

### DELETE /api/albums/[id]
Hapus album dan file cover image-nya.

**Response:** 200 OK
```json
{
  "message": "Album deleted successfully"
}
```

## Security & Permissions

### Row Level Security (RLS)
- **Read (SELECT)**: Semua authenticated users bisa melihat album
- **Insert/Update/Delete**: Hanya admin yang bisa mengelola album

### Storage Policies
- **Read**: Semua authenticated users bisa lihat gambar cover
- **Upload/Update/Delete**: Hanya admin yang bisa mengelola file

## Frontend Integration

### Custom Hook: useAlbums
```typescript
const {
  albums,         // Array of albums
  loading,        // Loading state
  error,          // Error message
  createAlbum,    // Create function
  updateAlbum,    // Update function
  deleteAlbum,    // Delete function
  refreshAlbums   // Refresh data
} = useAlbums();
```

### Usage Example
```typescript
// Create album
const success = await createAlbum(
  "Judul Album",
  "https://drive.google.com/...",
  fileObject,      // File object from input
  userId
);

// Update album
const success = await updateAlbum(
  albumId,
  "Judul Baru",
  "https://drive.google.com/...",
  newFileObject    // Optional: new cover image
);

// Delete album
const success = await deleteAlbum(albumId);
```

## File Upload Specifications
- **Supported formats**: JPG, PNG, GIF, WebP
- **Max file size**: 5MB
- **Storage location**: Supabase Storage bucket `album-covers`
- **Naming convention**: `{timestamp}-{random}.{extension}`
- **Access**: Public URL untuk display

## Error Handling
- File validation (type, size)
- URL validation untuk Google Drive
- Authentication checking
- Proper error messages dalam bahasa Indonesia
- Automatic cleanup file saat delete album

## Dependencies
- `@supabase/supabase-js`: Supabase client
- `base64-arraybuffer`: File upload processing
- `Next.js`: API routes framework

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
