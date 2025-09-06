'use client';

import { useAuth } from '@/contexts/AuthContext';
import { mockAnnouncements, mockPayments } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  // Calculate some stats
  const totalPayments = mockPayments.filter(p => p.status === 'paid').length;
  const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
  const totalAmount = mockPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const userPayments = mockPayments.filter(p => p.userId === user.id);
  const userPendingPayments = userPayments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user.houseNumber}
        </p>
      </div>


      {/* User's Pending Payments Alert */}
      {userPendingPayments.length > 0 && (
        <Alert>
          <Megaphone className="h-4 w-4" />
          <AlertDescription>
            Anda memiliki {userPendingPayments.length} pembayaran yang belum diselesaikan.
            Silakan kunjungi halaman pembayaran untuk melunasi.
          </AlertDescription>
        </Alert>
      )}

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Pengumuman Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnnouncements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada pengumuman
            </p>
          ) : (
            mockAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <Badge variant="outline">
                    {format(announcement.createdAt, 'dd MMM yyyy', {
                      locale: id,
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {announcement.content}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
