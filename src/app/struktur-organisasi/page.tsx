"use client";

import { useAuth } from "@/contexts/CustomAuthContext";
import { useOrganizationalStructure } from "@/hooks/use-organizational-structure";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone } from "lucide-react";

export default function StrukturOrganisasiPage() {
  const { user } = useAuth();
  const { users, isLoading, error } = useOrganizationalStructure();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Struktur Organisasi
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Struktur kepengurusan perumahan
          </p>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Struktur Organisasi
          </h1>
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Struktur Organisasi
          </h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Struktur kepengurusan dan susunan organisasi perumahan
        </p>
      </div>

      {/* Organization Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Belum ada struktur kepengurusan yang ditetapkan.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    Blok Rumah
                  </TableHead>
                  <TableHead>
                    Nama
                  </TableHead>
                  <TableHead>
                    Jabatan
                  </TableHead>
                  <TableHead>
                    No. Telepon
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">
                      {userData.houseNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {userData.name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {userData.positions?.position && (
                          <Badge variant="secondary">
                            {userData.positions.position}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userData.phoneNumber ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {userData.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
