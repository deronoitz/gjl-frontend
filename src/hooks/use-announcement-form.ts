import { useState, useCallback } from "react";

export interface AnnouncementFormData {
  title: string;
  content: string;
}

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

interface UseAnnouncementFormProps {
  createAnnouncement: (data: AnnouncementFormData) => Promise<AnnouncementData | null>;
  updateAnnouncement: (id: string, data: AnnouncementFormData) => Promise<AnnouncementData | null>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
}

export function useAnnouncementForm({
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
}: UseAnnouncementFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ title: "", content: "" });
    setEditingId(null);
    setMessage("");
  }, []);

  const showMessage = useCallback((msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim() || !formData.content.trim()) {
        setMessage("Judul dan konten harus diisi");
        return;
      }

      setIsSubmitting(true);
      setMessage("");

      try {
        const trimmedData = {
          title: formData.title.trim(),
          content: formData.content.trim(),
        };

        if (editingId) {
          const updated = await updateAnnouncement(editingId, trimmedData);
          if (updated) {
            showMessage("Pengumuman berhasil diupdate");
          }
        } else {
          const created = await createAnnouncement(trimmedData);
          if (created) {
            showMessage("Pengumuman berhasil ditambahkan");
          }
        }

        resetForm();
        setIsDialogOpen(false);
      } catch {
        setMessage("Terjadi kesalahan saat menyimpan pengumuman");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingId, createAnnouncement, updateAnnouncement, resetForm, showMessage]
  );

  const handleEdit = useCallback((announcement: AnnouncementData) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (announcementId: string) => {
      const success = await deleteAnnouncement(announcementId);
      if (success) {
        showMessage("Pengumuman berhasil dihapus");
      } else {
        showMessage("Gagal menghapus pengumuman");
      }
    },
    [deleteAnnouncement, showMessage]
  );

  const handleCreateNew = useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        resetForm();
      }
    },
    [resetForm]
  );

  return {
    // State
    isDialogOpen,
    editingId,
    formData,
    message,
    isSubmitting,
    isEditing: editingId !== null,

    // Actions
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateNew,
    handleDialogOpenChange,
    resetForm,
  };
}
