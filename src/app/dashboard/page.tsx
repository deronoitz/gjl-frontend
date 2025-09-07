'use client';

import { useAuth } from '@/contexts/CustomAuthContext';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import MonthlyFeeCard from '@/components/MonthlyFeeCard';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { announcements, isLoading: announcementsLoading, error: announcementsError } = useAnnouncements();
  
  if (!user) return null;

  // Get the latest 3 announcements for dashboard
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Compact for mobile */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Selamat datang, {user.houseNumber}
        </p>
      </div>

      {/* Info Cards - Single column on mobile, responsive grid */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyFeeCard />
      </div>

      {/* Announcements - More compact on mobile */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Bell className="h-5 w-5 text-blue-600" />
            Pengumuman Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
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
          ) : latestAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-muted-foreground">
                Belum ada pengumuman
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestAnnouncements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className={`p-3 md:p-4 border rounded-lg space-y-2 transition-all hover:shadow-sm ${
                    index === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Mobile-optimized header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm md:text-base leading-tight flex-1">
                        {announcement.title}
                      </h4>
                      <Badge 
                        variant={index === 0 ? "default" : "outline"} 
                        className="text-xs whitespace-nowrap flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        {format(new Date(announcement.createdAt), 'dd MMM', {
                          locale: id,
                        })}
                      </Badge>
                    </div>
                    
                    {/* Content - truncated on mobile */}
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none whitespace-pre-line">
                      {announcement.content}
                    </p>
                    
                    {/* Author - smaller on mobile */}
                    {announcement.authorName && (
                      <p className="text-xs text-muted-foreground/80">
                        oleh {announcement.authorName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Show more link for mobile */}
              {announcements.length > 3 && (
                <div className="text-center pt-2">
                  <button className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Lihat semua pengumuman ({announcements.length})
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
