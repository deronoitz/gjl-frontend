"use client";

import { useState, useMemo } from "react";
import { useResidents } from "@/hooks/use-residents";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  Search,
  Home,
  Phone,
  User,
  MessageCircle,
} from "lucide-react";

export default function WargaPage() {
  const { residents, loading, error } = useResidents();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("houseNumber");
  const [filterByPosition, setFilterByPosition] = useState("all");

  // Get unique positions for filter
  const positions = useMemo(() => {
    const uniquePositions = new Set();
    residents.forEach((resident) => {
      if (resident.positions) {
        uniquePositions.add(resident.positions.position);
      }
    });
    return Array.from(uniquePositions) as string[];
  }, [residents]);

  // Filter and sort residents
  const filteredAndSortedResidents = useMemo(() => {
    const filtered = residents.filter((resident) => {
      const matchesSearch =
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.house_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (resident.phone_number && resident.phone_number.includes(searchTerm));

      const matchesPosition =
        filterByPosition === "all" ||
        (filterByPosition === "none" && !resident.positions) ||
        (resident.positions &&
          resident.positions.position === filterByPosition);

      return matchesSearch && matchesPosition;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "houseNumber":
          return a.house_number.localeCompare(b.house_number, undefined, {
            numeric: true,
          });
        case "position":
          const posA = a.positions?.position || "";
          const posB = b.positions?.position || "";
          return posA.localeCompare(posB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [residents, searchTerm, sortBy, filterByPosition]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data warga...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Daftar Warga
          </h1>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Pencarian & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari Warga</label>
                <Input
                  placeholder="Nama, nomor rumah, atau telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Urutkan dari
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="houseNumber">Nomor Rumah</SelectItem>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="position">Jabatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Position */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jabatan</label>
                <Select
                  value={filterByPosition}
                  onValueChange={setFilterByPosition}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jabatan</SelectItem>
                    <SelectItem value="none">Tanpa Jabatan</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredAndSortedResidents.length} dari{" "}
            {residents.length} warga
          </p>
          {searchTerm && (
            <Badge variant="secondary">
              Hasil pencarian: &ldquo;{searchTerm}&rdquo;
            </Badge>
          )}
        </div>

        {/* Mobile Card Layout / Desktop Table */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 md:pb-0">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              Daftar Warga ({filteredAndSortedResidents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 md:px-6">
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3 px-4 pb-4">
              {filteredAndSortedResidents.map((resident) => (
                <Card
                  key={resident.id}
                  className="border border-gray-200 hover:shadow-sm py-0 transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-base">
                            {resident.house_number}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {resident.name}
                        </p>
                        {resident.phone_number && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            <a
                              href={`tel:${resident.phone_number}`}
                              className="hover:text-green-600 transition-colors"
                            >
                              {resident.phone_number}
                            </a>
                          </div>
                        )}
                        {resident.positions?.position && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{resident.positions.position}</span>
                          </div>
                        )}
                      </div>
                      {resident.positions && (
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs"
                        >
                          {resident.positions.position}
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons for mobile */}
                    {resident.phone_number && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() =>
                              window.open(`tel:${resident.phone_number}`)
                            }
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Telepon
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              if (resident.phone_number) {
                                window.open(
                                  `https://wa.me/${resident.phone_number.replace(
                                    /\D/g,
                                    ""
                                  )}`,
                                  "_blank"
                                );
                              }
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredAndSortedResidents.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ditemukan warga yang sesuai dengan pencarian &ldquo;
                    {searchTerm}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Rumah</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>No. Telepon</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-600" />
                          {resident.house_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{resident.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {resident.phone_number ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <a
                              href={`tel:${resident.phone_number}`}
                              className="hover:text-green-600 transition-colors"
                            >
                              {resident.phone_number}
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resident.positions ? (
                          <Badge
                            variant="default"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {resident.positions.position}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resident.phone_number ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`tel:${resident.phone_number}`)
                              }
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                if (resident.phone_number) {
                                  window.open(
                                    `https://wa.me/${resident.phone_number.replace(
                                      /\D/g,
                                      ""
                                    )}`,
                                    "_blank"
                                  );
                                }
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAndSortedResidents.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ditemukan warga yang sesuai dengan pencarian &ldquo;
                    {searchTerm}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty state for no residents at all */}
        {residents.length === 0 && !searchTerm && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada data warga
                </h3>
                <p className="text-gray-500">Data warga akan muncul di sini</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
