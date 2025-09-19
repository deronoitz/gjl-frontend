"use client";

import { Badge } from "@/components/ui/badge";

interface ResultsSummaryProps {
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
}

export function ResultsSummary({
  filteredCount,
  totalCount,
  searchTerm,
}: ResultsSummaryProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Menampilkan {filteredCount} dari {totalCount} warga
      </p>
      {searchTerm && (
        <Badge variant="secondary">
          Hasil pencarian: &ldquo;{searchTerm}&rdquo;
        </Badge>
      )}
    </div>
  );
}
