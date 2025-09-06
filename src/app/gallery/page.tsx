'use client';

import { useState } from 'react';
import { mockAlbums } from '@/lib/mock-data';
import { Album } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, Image as ImageIcon, Edit, Trash2, Upload, ExternalLink, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';

export default function GalleryPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    coverImageUrl: '',
    driveUrl: ''
  });
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.coverImageUrl.trim() || !formData.driveUrl.trim()) {
      setMessage('Judul, URL gambar cover, dan URL Google Drive harus diisi');
      return;
    }

    // Simple URL validation for cover image
    try {
      new URL(formData.coverImageUrl);
    } catch {
      setMessage('URL gambar cover tidak valid');
      return;
    }

    // Simple URL validation for Google Drive
    try {
      new URL(formData.driveUrl);
    } catch {
      setMessage('URL Google Drive tidak valid');
      return;
    }

    if (editingAlbum) {
      // Update existing album
      setAlbums(albums.map(album => 
        album.id === editingAlbum.id 
          ? { ...album, title: formData.title, coverImageUrl: formData.coverImageUrl, driveUrl: formData.driveUrl }
          : album
      ));
      setMessage('Album berhasil diupdate');
    } else {
      // Add new album
      const newAlbum: Album = {
        id: Date.now().toString(),
        title: formData.title,
        coverImageUrl: formData.coverImageUrl,
        driveUrl: formData.driveUrl,
        createdAt: new Date(),
        authorId: user?.id || ''
      };
      setAlbums([newAlbum, ...albums]);
      setMessage('Album berhasil ditambahkan');
    }

    // Reset form
    setFormData({ title: '', coverImageUrl: '', driveUrl: '' });
    setEditingAlbum(null);
    setIsDialogOpen(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      coverImageUrl: album.coverImageUrl,
      driveUrl: album.driveUrl
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (albumId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus album ini?')) {
      setAlbums(albums.filter(album => album.id !== albumId));
      setMessage('Album berhasil dihapus');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetDialog = () => {
    setFormData({ title: '', coverImageUrl: '', driveUrl: '' });
    setEditingAlbum(null);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeri Album</h1>
          <p className="text-muted-foreground">
            Kumpulan album foto kegiatan dan momen di perumahan
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAlbum ? 'Edit Album' : 'Tambah Album Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Album</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Kegiatan Gotong Royong September 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coverImageUrl">URL Gambar Cover</Label>
                  <Input
                    id="coverImageUrl"
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    placeholder="https://example.com/cover-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL gambar untuk cover album (JPG, PNG, GIF)
                  </p>
                </div>

                <div>
                  <Label htmlFor="driveUrl">URL Google Drive</Label>
                  <Input
                    id="driveUrl"
                    type="url"
                    value={formData.driveUrl}
                    onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link folder Google Drive yang berisi foto-foto album
                  </p>
                </div>

                {formData.coverImageUrl && (
                  <div className="border rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-2">Preview Cover:</p>
                    <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={formData.coverImageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={() => setMessage('Gambar cover tidak dapat dimuat. Periksa URL.')}
                      />
                    </div>
                  </div>
                )}
                
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">
                    <Upload className="h-4 w-4 mr-2" />
                    {editingAlbum ? 'Update' : 'Tambah'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {message && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {albums.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Belum ada album</h3>
              <p className="text-muted-foreground mb-4">
                {isAdmin 
                  ? 'Mulai dengan menambahkan album foto pertama' 
                  : 'Galeri masih kosong, tunggu admin mengunggah album foto kegiatan'
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Album
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {albums.map((album) => (
            <Card key={album.id} className="overflow-hidden">
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={album.coverImageUrl}
                  alt={album.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Show placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {/* Fallback placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FolderOpen className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-tight">{album.title}</CardTitle>
                  <Badge variant="outline" className="text-xs w-fit">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(album.createdAt, 'dd MMM yyyy', { locale: id })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    onClick={() => window.open(album.driveUrl, '_blank')}
                    className="flex-1 mr-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Album
                  </Button>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(album)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(album.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {isAdmin ? (
              <>
                <p>• Klik &quot;Tambah Album&quot; untuk membuat album foto baru</p>
                <p>• Upload foto-foto ke Google Drive dan bagikan folder dengan akses publik</p>
                <p>• Pastikan URL Google Drive dapat diakses oleh semua orang</p>
                <p>• Gunakan gambar cover yang menarik untuk setiap album</p>
                <p>• Berikan judul yang deskriptif untuk setiap album</p>
              </>
            ) : (
              <>
                <p>• Album-album foto diunggah oleh admin perumahan</p>
                <p>• Klik &quot;Lihat Album&quot; untuk membuka folder Google Drive</p>
                <p>• Di Google Drive, Anda dapat melihat dan mendownload foto-foto</p>
                <p>• Album terbaru akan muncul di bagian atas</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
