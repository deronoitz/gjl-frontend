'use client';

import { useState } from 'react';
import { Album } from '@/types';
import { useAuth } from '@/contexts/CustomAuthContext';
import { useAlbums } from '@/hooks/use-albums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, Image as ImageIcon, Edit, Trash2, Upload, ExternalLink, FolderOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';

export default function GalleryPage() {
  const { user } = useAuth();
  const {
    albums,
    loading,
    error: apiError,
    createAlbum,
    updateAlbum,
    deleteAlbum
  } = useAlbums();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    coverImageUrl: '',
    driveUrl: ''
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setMessage('File harus berupa gambar (JPG, PNG, GIF, dll)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Ukuran file maksimal 5MB');
        return;
      }

      setCoverImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.driveUrl.trim()) {
      setMessage('Judul dan URL Google Drive harus diisi');
      return;
    }

    if (!editingAlbum && (!coverImageFile || !coverImagePreview)) {
      setMessage('Gambar cover harus dipilih');
      return;
    }

    // Simple URL validation for Google Drive
    try {
      new URL(formData.driveUrl);
    } catch {
      setMessage('URL Google Drive tidak valid');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      let success = false;

      if (editingAlbum) {
        // Update existing album
        success = await updateAlbum(
          editingAlbum.id,
          formData.title,
          formData.driveUrl,
          coverImageFile
        );
        if (success) {
          setMessage('Album berhasil diupdate');
        }
      } else {
        // Create new album
        if (!user?.id) {
          setMessage('User tidak terautentikasi');
          return;
        }

        success = await createAlbum(
          formData.title,
          formData.driveUrl,
          coverImageFile,
          user.id
        );
        if (success) {
          setMessage('Album berhasil ditambahkan');
        }
      }

      if (success) {
        // Reset form
        setFormData({ title: '', coverImageUrl: '', driveUrl: '' });
        setCoverImageFile(null);
        setCoverImagePreview('');
        setEditingAlbum(null);
        setIsDialogOpen(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Terjadi kesalahan, coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      coverImageUrl: album.coverImageUrl,
      driveUrl: album.driveUrl
    });
    setCoverImagePreview(album.coverImageUrl); // Set current image as preview
    setCoverImageFile(null); // Reset file since we're editing
    setIsDialogOpen(true);
  };

  const handleDelete = async (albumId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus album ini?')) {
      const success = await deleteAlbum(albumId);
      if (success) {
        setMessage('Album berhasil dihapus');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const resetDialog = () => {
    setFormData({ title: '', coverImageUrl: '', driveUrl: '' });
    setCoverImageFile(null);
    setCoverImagePreview('');
    setEditingAlbum(null);
    setMessage('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="space-y-3">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              Galeri Album
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kumpulan album foto kegiatan dan momen di perumahan
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Album
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-2 md:mx-0 w-[calc(100vw-1rem)] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    {editingAlbum ? 'Edit Album' : 'Tambah Album Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Judul Album</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Kegiatan Gotong Royong September 2024"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverImage" className="text-sm font-medium">Gambar Cover</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer h-11 file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground file:hover:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload gambar untuk cover album (JPG, PNG, GIF, maksimal 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driveUrl" className="text-sm font-medium">URL Google Drive</Label>
                    <Input
                      id="driveUrl"
                      type="url"
                      value={formData.driveUrl}
                      onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link folder Google Drive yang berisi foto-foto album
                    </p>
                  </div>

                  {coverImagePreview && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-xs font-medium text-gray-700 mb-2">Preview Cover:</p>
                      <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={coverImagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={() => setMessage('Gambar cover tidak dapat dimuat.')}
                        />
                      </div>
                    </div>
                  )}
                  
                  {message && (
                    <Alert>
                      <AlertDescription className="text-sm">{message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-col-reverse md:flex-row justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11">
                      Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingAlbum ? 'Mengupdate...' : 'Menambahkan...'}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {editingAlbum ? 'Update' : 'Tambah'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {(message || apiError) && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">{message || apiError}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" />
            <span className="block mt-2 text-sm text-muted-foreground">Memuat album...</span>
          </div>
        </div>
      ) : albums.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center max-w-sm">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum ada album</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAdmin 
                  ? 'Mulai dengan menambahkan album foto pertama' 
                  : 'Galeri masih kosong, tunggu admin mengunggah album foto kegiatan'
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Album
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Album Count */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {albums.length} album
          </div>
          
          {/* Mobile-Optimized Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden">
                <div className="aspect-video relative bg-gray-100 overflow-hidden">
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
                </div>
                
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="space-y-2">
                    <CardTitle className="text-base md:text-lg leading-tight line-clamp-2">
                      {album.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs w-fit">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(album.createdAt, 'dd MMM yyyy', { locale: id })}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(album.driveUrl, '_blank')}
                      className="w-full h-9"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lihat Album
                    </Button>
                    
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(album)}
                          className="flex-1 h-9"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(album.id)}
                          className="flex-1 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Mobile-Optimized Info Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-600" />
            Informasi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            {isAdmin ? (
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Klik &quot;Tambah Album&quot; untuk membuat album foto baru</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Upload gambar cover dari perangkat Anda (maksimal 5MB)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Upload foto-foto ke Google Drive dan bagikan folder dengan akses publik</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Pastikan URL Google Drive dapat diakses oleh semua orang</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Album-album foto diunggah oleh admin perumahan</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Klik &quot;Lihat Album&quot; untuk membuka folder Google Drive</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Di Google Drive, Anda dapat melihat dan mendownload foto-foto</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
