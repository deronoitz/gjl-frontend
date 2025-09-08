'use client';

import { useAuth } from '@/contexts/CustomAuthContext';
import { useUsers } from '@/hooks/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Network, Phone, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function StrukturOrganisasiPage() {
  const { user } = useAuth();
  const { users, isLoading, error } = useUsers();

  if (!user) return null;

  // Sort users by position hierarchy, then by name
  const sortedUsers = [...users].sort((a, b) => {
    const getPositionPriority = (position: string | undefined) => {
      if (!position) return 6;
      const pos = position.toLowerCase();
      if (pos.includes('ketua')) return 1;
      if (pos.includes('sekretaris')) return 2;
      if (pos.includes('bendahara')) return 3;
      if (pos.includes('koordinator')) return 4;
      if (pos.includes('keamanan') || pos.includes('security')) return 5;
      return 6;
    };

    const priorityA = getPositionPriority(a.position);
    const priorityB = getPositionPriority(b.position);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Struktur Organisasi</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Struktur kepengurusan perumahan
          </p>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-transparent"></div>
            Memuat struktur organisasi...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Struktur Organisasi</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Struktur kepengurusan perumahan
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat data struktur organisasi. Silakan muat ulang halaman.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Network className="h-6 w-6 md:h-7 md:w-7 text-slate-600" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Struktur Organisasi</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Struktur kepengurusan dan susunan organisasi perumahan
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-slate-700">{users.length}</div>
            <div className="text-sm text-slate-600">Total Warga</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-emerald-700">
              {users.filter(u => u.position && u.position !== '').length}
            </div>
            <div className="text-sm text-slate-600">Punya Jabatan</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-amber-700">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-slate-600">Admin</div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Table */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg text-slate-800">Daftar Pengurus dan Warga</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                <TableHead className="w-[100px] font-semibold text-slate-700">No. Rumah</TableHead>
                <TableHead className="font-semibold text-slate-700">Nama</TableHead>
                <TableHead className="font-semibold text-slate-700">Jabatan</TableHead>
                <TableHead className="font-semibold text-slate-700">No. Telepon</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="w-[120px] font-semibold text-slate-700">Bergabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((userData) => (
                <TableRow 
                  key={userData.id} 
                  className={`hover:bg-slate-50 border-slate-200 ${
                    userData.position && userData.position !== '' ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <TableCell className="font-medium text-slate-900">
                    {userData.houseNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {userData.name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {userData.position ? (
                        <Badge 
                          variant="secondary" 
                          className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium"
                        >
                          {userData.position}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {userData.phoneNumber ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Phone className="h-3 w-3" />
                        {userData.phoneNumber}
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {userData.role === 'admin' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(userData.createdAt), 'MMM yyyy', { locale: id })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="bg-slate-50 border-slate-200 border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-slate-600">
            Data struktur organisasi diperbarui secara otomatis berdasarkan informasi profil warga.
            <br className="hidden md:block" />
            Untuk mengubah jabatan, hubungi administrator perumahan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
