'use client';

import { useState } from 'react';
import { useAnnouncements } from '@/hooks/use-announcements';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const {
    announcements,
    isLoading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  } = useAnnouncements();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'admin') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage('Judul dan konten harus diisi');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      if (editingId) {
        // Update existing announcement
        const updated = await updateAnnouncement(editingId, {
          title: formData.title.trim(),
          content: formData.content.trim()
        });
        if (updated) {
          setMessage('Pengumuman berhasil diupdate');
        }
      } else {
        // Add new announcement
        const created = await createAnnouncement({
          title: formData.title.trim(),
          content: formData.content.trim()
        });
        if (created) {
          setMessage('Pengumuman berhasil ditambahkan');
        }
      }

      // Reset form
      setFormData({ title: '', content: '' });
      setEditingId(null);
      setIsDialogOpen(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Terjadi kesalahan saat menyimpan pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement: { id: string; title: string; content: string }) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (announcementId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      const success = await deleteAnnouncement(announcementId);
      if (success) {
        setMessage('Pengumuman berhasil dihapus');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal menghapus pengumuman');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const resetDialog = () => {
    setFormData({ title: '', content: '' });
    setEditingId(null);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengumuman</h1>
          <p className="text-muted-foreground">
            Buat dan kelola pengumuman untuk warga perumahan
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetDialog();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Pengumuman
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Pengumuman</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul pengumuman"
                />
              </div>
              <div>
                <Label htmlFor="content">Konten Pengumuman</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Masukkan konten pengumuman..."
                  rows={6}
                />
              </div>
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? 'Menyimpan...' 
                    : editingId 
                      ? 'Update' 
                      : 'Publikasikan'
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert>
          <Megaphone className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Memuat pengumuman...</h3>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Alert>
                  <AlertDescription>
                    Gagal memuat pengumuman: {error}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Belum ada pengumuman</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan membuat pengumuman pertama
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Pengumuman
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {format(new Date(announcement.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        oleh {announcement.authorName || 'Admin'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
