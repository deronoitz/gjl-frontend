"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { memo, useState } from "react";
import { toast } from "sonner";

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

interface AnnouncementCardProps {
  announcement: AnnouncementData;
  index: number;
  onEdit: (announcement: AnnouncementData) => void;
  onDelete: (id: string) => void;
}

const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const AnnouncementCard = memo(function AnnouncementCard({
  announcement,
  index,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = () => {
    onEdit(announcement);
  };

  const handleDelete = () => {
    toast("Apakah Anda yakin ingin menghapus pengumuman ini?", {
      description: announcement.title,
      action: {
        label: "Hapus",
        onClick: () => onDelete(announcement.id),
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldShowExpandButton = announcement.content.length > 150;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                onClick={handleEdit}
                className="h-7 w-7 md:h-8 md:w-8 p-0"
                aria-label="Edit pengumuman"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-50 text-red-600"
                aria-label="Hapus pengumuman"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex flex-col space-y-1 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-3">
              <Badge
                variant={index === 0 ? "default" : "outline"}
                className="text-xs w-fit flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(announcement.createdAt), "dd MMM yyyy", {
                  locale: id,
                })}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>oleh {announcement.authorName || "Admin"}</span>
              </div>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden md:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="h-8 lg:h-9 text-xs md:text-sm"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
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
          <p className="text-sm md:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {isExpanded ? announcement.content : truncateText(announcement.content, 150)}
          </p>
          {shouldShowExpandButton && (
            <Button
              variant="link"
              size="sm"
              onClick={toggleExpanded}
              className="p-0 h-auto text-xs mt-2 text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? "Sembunyikan" : "Lihat Selengkapnya"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
