import { useMemo } from "react";
import { Resident } from "./use-residents";

export type SortOption = "houseNumber" | "name" | "position";

interface UseResidentFiltersProps {
  residents: Resident[];
  searchTerm: string;
  sortBy: SortOption;
  filterByPosition: string;
}

export function useResidentFilters({
  residents,
  searchTerm,
  sortBy,
  filterByPosition,
}: UseResidentFiltersProps) {
  // Get unique positions for filter
  const positions = useMemo(() => {
    const uniquePositions = new Set<string>();
    residents.forEach((resident) => {
      if (resident.positions?.position) {
        uniquePositions.add(resident.positions.position);
      }
    });
    return Array.from(uniquePositions).sort();
  }, [residents]);

  // Filter and sort residents
  const filteredAndSortedResidents = useMemo(() => {
    const filtered = residents.filter((resident) => {
      const matchesSearch = matchesSearchTerm(resident, searchTerm);
      const matchesPosition = matchesPositionFilter(resident, filterByPosition);
      return matchesSearch && matchesPosition;
    });

    return sortResidents(filtered, sortBy);
  }, [residents, searchTerm, sortBy, filterByPosition]);

  return {
    positions,
    filteredAndSortedResidents,
  };
}

function matchesSearchTerm(resident: Resident, searchTerm: string): boolean {
  if (!searchTerm) return true;

  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return (
    resident.name.toLowerCase().includes(lowerSearchTerm) ||
    resident.house_number.toLowerCase().includes(lowerSearchTerm) ||
    (resident.phone_number?.includes(searchTerm) ?? false)
  );
}

function matchesPositionFilter(resident: Resident, filterByPosition: string): boolean {
  if (filterByPosition === "all") return true;
  if (filterByPosition === "none") return !resident.positions;
  
  return resident.positions?.position === filterByPosition;
}

function sortResidents(residents: Resident[], sortBy: SortOption): Resident[] {
  return [...residents].sort((a, b) => {
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
}
