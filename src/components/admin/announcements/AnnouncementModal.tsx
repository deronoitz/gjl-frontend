"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { AnnouncementForm } from "./AnnouncementForm";
import { memo, ReactNode } from "react";

interface AnnouncementFormData {
  title: string;
  content: string;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  isMobile: boolean;
  formData: AnnouncementFormData;
  message: string;
  trigger?: ReactNode;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: AnnouncementFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  isEditing,
  isSubmitting,
  formData,
  message,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: Omit<AnnouncementModalProps, "isMobile" | "onReset" | "trigger">) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg">
            {isEditing ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[70vh] overflow-y-auto px-1">
          <AnnouncementForm
            formData={formData}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
            message={message}
            onFormDataChange={onFormDataChange}
            onSubmit={onSubmit}
            formId="announcement-form"
          />
        </div>
        <DrawerFooter className="pt-4 border-t bg-background">
          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              size="lg"
              form="announcement-form"
              disabled={isSubmitting}
              className="w-full"
            >
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

const DesktopDialog = memo(function DesktopDialog({
  isOpen,
  isEditing,
  isSubmitting,
  formData,
  message,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: Omit<AnnouncementModalProps, "isMobile" | "onReset" | "trigger">) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="mx-2 md:mx-0 w-[calc(100vw-1rem)] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {isEditing ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
          </DialogTitle>
        </DialogHeader>
        <AnnouncementForm
          formData={formData}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          message={message}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          showCancelButton
        />
      </DialogContent>
    </Dialog>
  );
});

export const AnnouncementModal = memo(function AnnouncementModal({
  isMobile,
  onReset,
  onOpenChange,
  trigger,
  ...props
}: AnnouncementModalProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      onReset();
    }
  };

  const modalProps = {
    ...props,
    onOpenChange: handleOpenChange,
  };

  return (
    <>
      {trigger}
      {isMobile ? (
        <MobileDrawer {...modalProps} />
      ) : (
        <DesktopDialog {...modalProps} />
      )}
    </>
  );
});

// Default trigger button component
interface CreateAnnouncementTriggerProps {
  onClick?: () => void;
}

export const CreateAnnouncementTrigger = memo(function CreateAnnouncementTrigger({
  onClick
}: CreateAnnouncementTriggerProps) {
  return (
    <Button className="w-full md:w-auto" size="lg" onClick={onClick}>
      <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
      Buat Pengumuman
    </Button>
  );
});
