'use client';

import { useAuth } from '@/contexts/CustomAuthContext';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import MonthlyFeeCard from '@/components/MonthlyFeeCard';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  const { announcements, isLoading: announcementsLoading, error: announcementsError } = useAnnouncements();
  
  if (!user) return null;

  // Get the latest 3 announcements for dashboard
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user.houseNumber}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyFeeCard />
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Pengumuman Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcementsLoading ? (
            <p className="text-muted-foreground text-center py-4">
              Memuat pengumuman...
            </p>
          ) : announcementsError ? (
            <Alert>
              <AlertDescription>
                Gagal memuat pengumuman: {announcementsError}
              </AlertDescription>
            </Alert>
          ) : latestAnnouncements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada pengumuman
            </p>
          ) : (
            latestAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <Badge variant="outline">
                    {format(new Date(announcement.createdAt), 'dd MMM yyyy', {
                      locale: id,
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {announcement.content}
                </p>
                {announcement.authorName && (
                  <p className="text-xs text-muted-foreground">
                    oleh {announcement.authorName}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
