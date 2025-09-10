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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from '@/components/ui/drawer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Megaphone, Calendar, User, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

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

  const toggleExpanded = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-3 md:space-y-5 lg:space-y-6">
      {/* Responsive Header - Optimized for tablet */}
      <div className="space-y-2 md:space-y-3">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
              <Megaphone className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600" />
              Kelola Pengumuman
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
              Buat dan kelola pengumuman untuk warga perumahan
            </p>
          </div>
          
          {isMobile ? (
            <Drawer open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}>
              <DrawerTrigger asChild>
                <Button className="w-full md:w-auto" size="lg">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Buat Pengumuman
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-lg">
                    {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[70vh] overflow-y-auto px-1">
                  <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm md:text-base font-medium">Judul Pengumuman</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Masukkan judul pengumuman"
                        className="h-10 md:h-12 text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm md:text-base font-medium">Konten Pengumuman</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Masukkan konten pengumuman..."
                        rows={5}
                        className="min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
                      />
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Tulis pengumuman dengan jelas dan lengkap
                      </p>
                    </div>
                    {message && (
                      <Alert>
                        <AlertDescription className="text-sm">{message}</AlertDescription>
                      </Alert>
                    )}
                  </form>
                </div>
                <DrawerFooter className="pt-4 border-t bg-background">
                  <div className="flex flex-col space-y-2">
                    <Button type="submit" size="lg" form="announcement-form" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {editingId ? 'Update' : 'Publikasikan'}
                        </>
                      )}
                    </Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Pengumuman
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-2 md:mx-0 w-[calc(100vw-1rem)] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-sm font-medium">Judul Pengumuman</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masukkan judul pengumuman"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="content" className="text-sm font-medium">Konten Pengumuman</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Masukkan konten pengumuman..."
                      rows={5}
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tulis pengumuman dengan jelas dan lengkap
                    </p>
                  </div>
                  {message && (
                    <Alert>
                      <AlertDescription className="text-sm">{message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-col-reverse md:flex-row justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2 pt-1">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">
                      Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-10">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {editingId ? 'Update' : 'Publikasikan'}
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

      {message && (
        <Alert>
          <Megaphone className="h-4 w-4" />
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="space-y-2 md:space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-gray-500" />
                <h3 className="text-base font-semibold mb-1">Memuat pengumuman...</h3>
                <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Alert>
                  <AlertDescription className="text-sm">
                    Gagal memuat pengumuman: {error}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        ) : announcements.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center max-w-sm">
                <div className="bg-gray-100 rounded-full p-2 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Megaphone className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-base font-semibold mb-1">Belum ada pengumuman</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Mulai dengan membuat pengumuman pertama untuk warga
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Pengumuman
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Announcement Count */}
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Menampilkan {announcements.length} pengumuman
            </div>
            
            {announcements.map((announcement, index) => (
              <Card key={announcement.id} className={`overflow-hidden hover:shadow-md transition-shadow ${
                index === 0 ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
              }`}>
                {/* Tablet-optimized header */}
                <CardHeader className="pb-2 md:pb-3">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base md:text-lg lg:text-xl leading-tight flex-1 line-clamp-2">
                        {announcement.title}
                      </CardTitle>
                      {/* Mobile action buttons */}
                      <div className="flex space-x-1 md:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Metadata row */}
                    <div className="flex flex-col space-y-1 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-3">
                        <Badge variant={index === 0 ? "default" : "outline"} className="text-xs w-fit flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(announcement.createdAt), 'dd MMM yyyy', { locale: id })}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>oleh {announcement.authorName || 'Admin'}</span>
                        </div>
                      </div>
                      
                      {/* Desktop action buttons */}
                      <div className="hidden md:flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                          className="h-8 lg:h-9 text-xs md:text-sm"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="h-8 lg:h-9 text-xs md:text-sm hover:bg-red-50 text-red-600 border-red-200"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 lg:p-5">
                    <p className="text-sm md:text-base lg:text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {expandedAnnouncements.has(announcement.id) 
                        ? announcement.content 
                        : truncateText(announcement.content, 150)
                      }
                    </p>
                    {announcement.content.length > 150 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleExpanded(announcement.id)}
                        className="p-0 h-auto text-xs mt-2 text-blue-600 hover:text-blue-800"
                      >
                        {expandedAnnouncements.has(announcement.id) ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
      
      {/* Info Section */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-gray-600" />
              Tips Pengumuman
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
              <div className="grid gap-1">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Gunakan judul yang jelas dan mudah dipahami</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Tulis informasi yang lengkap dan akurat</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Pengumuman terbaru akan muncul di dashboard warga</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
