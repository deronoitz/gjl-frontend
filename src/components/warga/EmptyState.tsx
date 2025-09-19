"use client";

import { Users } from "lucide-react";

interface EmptyStateProps {
  searchTerm?: string;
  type: "no-data" | "no-results";
}

export function EmptyState({ searchTerm, type }: EmptyStateProps) {
  if (type === "no-data") {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Belum ada data warga
        </h3>
        <p className="text-gray-500">Data warga akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
      <p className="text-sm text-muted-foreground">
        Tidak ditemukan warga yang sesuai dengan pencarian &ldquo;
        {searchTerm}&rdquo;
      </p>
    </div>
  );
}
