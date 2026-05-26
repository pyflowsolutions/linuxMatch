'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Architecture, UseCase } from './distroData';

export interface FilterState {
  maxRam: number;
  maxStorage: number;
  architectures: Architecture[];
  useCases: UseCase[];
  releaseModels: string[];
  searchQuery: string;
  sortBy: 'compatibility' | 'rating' | 'ease' | 'name' | 'efficiency';
  compareIds: string[];
}

const DEFAULT_FILTERS: FilterState = {
  maxRam: 16384,
  maxStorage: 100,
  architectures: [],
  useCases: [],
  releaseModels: [],
  searchQuery: '',
  sortBy: 'compatibility',
  compareIds: [],
};

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeFilterCount: number;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, compareIds: filters.compareIds });

  const activeFilterCount =
    (filters.maxRam < 16384 ? 1 : 0) +
    (filters.maxStorage < 100 ? 1 : 0) +
    filters.architectures.length +
    filters.useCases.length +
    filters.releaseModels.length;

  const toggleCompare = (id: string) => {
    setFilters((prev) => {
      if (prev.compareIds.includes(id)) {
        return { ...prev, compareIds: prev.compareIds.filter((c) => c !== id) };
      }
      if (prev.compareIds.length >= 3) return prev;
      return { ...prev, compareIds: [...prev.compareIds, id] };
    });
  };

  const clearCompare = () => setFilters((prev) => ({ ...prev, compareIds: [] }));

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, resetFilters, activeFilterCount, toggleCompare, clearCompare }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useDistroFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useDistroFilter must be used within FilterProvider');
  return ctx;
}