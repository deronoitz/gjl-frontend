"use client";

import { useState } from "react";
import { useResidents } from "@/hooks/use-residents";
import { useResidentFilters, SortOption } from "@/hooks/use-resident-filters";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SearchAndFilters,
  ResultsSummary,
  ResidentCard,
  ResidentTable,
  EmptyState,
  LoadingState,
} from "@/components/warga";

export default function WargaPage() {
  const { residents, loading, error } = useResidents();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("houseNumber");
  const [filterByPosition, setFilterByPosition] = useState("all");

  const { positions, filteredAndSortedResidents } = useResidentFilters({
    residents,
    searchTerm,
    sortBy,
    filterByPosition,
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingState />
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
        <SearchAndFilters
          searchTerm={searchTerm}
          sortBy={sortBy}
          filterByPosition={filterByPosition}
          positions={positions}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
          onFilterChange={setFilterByPosition}
        />

        {/* Results Summary */}
        <ResultsSummary
          filteredCount={filteredAndSortedResidents.length}
          totalCount={residents.length}
          searchTerm={searchTerm}
        />

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
                <ResidentCard key={resident.id} resident={resident} />
              ))}

              {filteredAndSortedResidents.length === 0 && searchTerm && (
                <EmptyState searchTerm={searchTerm} type="no-results" />
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <ResidentTable residents={filteredAndSortedResidents} />

              {filteredAndSortedResidents.length === 0 && searchTerm && (
                <EmptyState searchTerm={searchTerm} type="no-results" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty state for no residents at all */}
        {residents.length === 0 && !searchTerm && (
          <Card>
            <CardContent className="pt-6">
              <EmptyState type="no-data" />
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
