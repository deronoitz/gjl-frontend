"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/CustomAuthContext";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import MonthlyFeeCard from "@/components/MonthlyFeeCard";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Calendar, ChevronDown, ChevronUp } from "lucide-react";

// Component untuk menampilkan content dengan tombol lihat selengkapnya
function AnnouncementContent({
  content,
  maxLength = 200,
}: {
  content: string;
  maxLength?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Adjust max length based on screen size
  const adjustedMaxLength =
    typeof window !== "undefined" && window.innerWidth >= 768
      ? maxLength + 100
      : maxLength;

  if (content.length <= adjustedMaxLength) {
    return (
      <p className="text-xs md:text-sm lg:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {content}
      </p>
    );
  }

  const truncatedContent = content.substring(0, adjustedMaxLength) + "...";

  return (
    <div className="space-y-2">
      <p className="text-xs md:text-sm lg:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {isExpanded ? content : truncatedContent}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
            Lihat lebih sedikit
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            Lihat selengkapnya
          </>
        )}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useAnnouncements();
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  if (!user) return null;

  // Get announcements to display based on toggle state
  const displayedAnnouncements = showAllAnnouncements 
    ? announcements 
    : announcements.slice(0, 3);

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      {/* Header - Responsive for all devices */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
          Selamat datang, {user.name}
        </p>
      </div>

      {/* Info Cards - Optimized for tablet portrait/landscape */}
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MonthlyFeeCard />
      </div>

      {/* Announcements - Optimized for all screen sizes */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 md:pb-0 lg:pb-0">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl lg:text-2xl">
            <Bell className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            Pengumuman Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 lg:space-y-5 px-3 md:px-5 lg:px-6">
          {announcementsLoading ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Memuat pengumuman...
              </div>
            </div>
          ) : announcementsError ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-sm">
                Gagal memuat pengumuman: {announcementsError}
              </AlertDescription>
            </Alert>
          ) : displayedAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-muted-foreground">
                Belum ada pengumuman
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAnnouncements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className={`p-3 md:p-4 lg:p-5 border rounded-lg space-y-2 md:space-y-3 transition-all hover:shadow-sm `}
                >
                  {/* Responsive header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 md:gap-3">
                      <h4 className="font-semibold text-sm md:text-base lg:text-lg leading-tight flex-1">
                        {announcement.title}
                      </h4>
                      <Badge
                        variant={index === 0 ? "default" : "outline"}
                        className="text-xs md:text-sm whitespace-nowrap flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        {format(new Date(announcement.createdAt), "dd MMM", {
                          locale: id,
                        })}
                      </Badge>
                    </div>

                    {/* Content - truncated on mobile */}
                    <AnnouncementContent
                      content={announcement.content}
                      maxLength={150}
                    />

                    {/* Author - responsive sizing */}
                    {announcement.authorName && (
                      <p className="text-xs md:text-sm text-muted-foreground/80">
                        oleh {announcement.authorName}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Show more/less link - responsive */}
              {announcements.length > 3 && (
                <div className="text-center pt-2 md:pt-3">
                  <button 
                    onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                    className="text-xs md:text-sm lg:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    {showAllAnnouncements ? (
                      <>
                        Lihat lebih sedikit
                        <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                      </>
                    ) : (
                      <>
                        Lihat semua pengumuman ({announcements.length})
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
