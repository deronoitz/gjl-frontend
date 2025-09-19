"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare } from "lucide-react";
import { memo } from "react";

interface AnnouncementFormData {
  title: string;
  content: string;
}

interface AnnouncementFormProps {
  formData: AnnouncementFormData;
  isSubmitting: boolean;
  isEditing: boolean;
  message: string;
  onFormDataChange: (data: AnnouncementFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  formId?: string;
}

export const AnnouncementForm = memo(function AnnouncementForm({
  formData,
  isSubmitting,
  isEditing,
  message,
  onFormDataChange,
  onSubmit,
  onCancel,
  showCancelButton = false,
  formId = "announcement-form",
}: AnnouncementFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ ...formData, title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormDataChange({ ...formData, content: e.target.value });
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4 md:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm md:text-base font-medium">
          Judul Pengumuman
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="Masukkan judul pengumuman"
          className="h-10 md:h-12 text-sm md:text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm md:text-base font-medium">
          Konten Pengumuman
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Masukkan konten pengumuman..."
          rows={5}
          className="min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
          required
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

      {showCancelButton && (
        <div className="flex flex-col-reverse md:flex-row justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10"
          >
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
                {isEditing ? "Update" : "Publikasikan"}
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
});
