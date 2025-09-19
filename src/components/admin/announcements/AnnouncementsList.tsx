"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Megaphone, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { AnnouncementCard } from "./AnnouncementCard";
import { memo } from "react";
import * as React from "react";

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

interface AnnouncementsListProps {
  announcements: AnnouncementData[];
  isLoading: boolean;
  error: string | null;
  onEdit: (announcement: AnnouncementData) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const LoadingState = memo(function LoadingState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-gray-500" />
          <h3 className="text-base font-semibold mb-1">Memuat pengumuman...</h3>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </CardContent>
    </Card>
  );
});

const ErrorState = memo(function ErrorState({ error }: { error: string }) {
  // Show error toast when component mounts
  React.useEffect(() => {
    toast.error(`Gagal memuat pengumuman: ${error}`);
  }, [error]);

  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">
              Gagal memuat pengumuman: {error}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const EmptyState = memo(function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
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
          <Button onClick={onCreateNew} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Buat Pengumuman
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const AnnouncementsCount = memo(function AnnouncementsCount({ count }: { count: number }) {
  return (
    <div className="text-sm text-muted-foreground flex items-center gap-1">
      <MessageSquare className="h-4 w-4" />
      Menampilkan {count} pengumuman
    </div>
  );
});

export const AnnouncementsList = memo(function AnnouncementsList({
  announcements,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreateNew,
}: AnnouncementsListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (announcements.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <>
      <AnnouncementsCount count={announcements.length} />
      <div className="space-y-2 md:space-y-3">
        {announcements.map((announcement, index) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
});
