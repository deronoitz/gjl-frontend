"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "@/hooks/use-resident-filters";

interface SearchAndFiltersProps {
  searchTerm: string;
  sortBy: SortOption;
  filterByPosition: string;
  positions: string[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: string) => void;
}

export function SearchAndFilters({
  searchTerm,
  sortBy,
  filterByPosition,
  positions,
  onSearchChange,
  onSortChange,
  onFilterChange,
}: SearchAndFiltersProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Urutkan dari</label>
                <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
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
            <Select value={filterByPosition} onValueChange={onFilterChange}>
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
  );
}
