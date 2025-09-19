'use client';

import { useAnnouncements } from '@/hooks/use-announcements';
import { useAnnouncementForm } from '@/hooks/use-announcement-form';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AnnouncementModal,
  CreateAnnouncementTrigger,
  AnnouncementsList,
  AnnouncementsTips,
} from '@/components/admin/announcements';

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

  const {
    isDialogOpen,
    formData,
    message,
    isSubmitting,
    isEditing,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateNew,
    handleDialogOpenChange,
  } = useAnnouncementForm({
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  });

  const isMobile = useIsMobile();

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-3 md:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="space-y-2 md:space-y-3">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
              Kelola Pengumuman
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
              Buat dan kelola pengumuman untuk warga perumahan
            </p>
          </div>
          
          <AnnouncementModal
            isOpen={isDialogOpen}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            isMobile={isMobile}
            formData={formData}
            message={message}
            trigger={<CreateAnnouncementTrigger onClick={handleCreateNew} />}
            onOpenChange={handleDialogOpenChange}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onReset={() => {}}
          />
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
        <AnnouncementsList
          announcements={announcements}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </div>
      
      {/* Tips Section */}
      {announcements.length > 0 && <AnnouncementsTips />}
    </div>
  );
}
