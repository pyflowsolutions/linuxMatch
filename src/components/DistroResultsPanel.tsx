'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, LayoutGrid, List, Star, Cpu, HardDrive, MemoryStick, CheckSquare, Square, ChevronRight,  } from 'lucide-react';
import { ALL_DISTROS, USE_CASE_CONFIG, Distro } from './distroData';
import { useDistroFilter } from './useDistroFilter';
import { DistroCardSkeleton } from '@/components/ui/LoadingSkeleton';
import Badge from '@/components/ui/Badge';

function ramLabel(mb: number) {
  return mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`;
}

function compatColor(score: number) {
  if (score >= 85) return 'compat-high';
  if (score >= 65) return 'compat-mid';
  return 'compat-low';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={`star-${s}`}
          size={12}
          className={
            s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-muted-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function DistroCard({ distro, onCompareToggle, isInCompare }: { distro: Distro; onCompareToggle: () => void; isInCompare: boolean }) {
  return (
    <div
      className={`group bg-card rounded-xl border transition-all duration-200 card-shadow hover:card-shadow-md hover:-translate-y-0.5 ${
        isInCompare ? 'border-primary primary-glow' : 'border-border hover:border-border'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: distro.logoColor }}
            >
              {distro.logoInitials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground leading-tight">{distro.name}</h3>
                {distro.isPopular && (
                  <Badge variant="primary" size="sm">Popular</Badge>
                )}
                {distro.isNew && (
                  <Badge variant="accent" size="sm">New</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                v{distro.latestVersion}
              </p>
            </div>
          </div>
          {/* Compatibility Score */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold tabular-nums ${compatColor(distro.compatibilityScore)}`}>
            {distro.compatibilityScore}%
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {distro.tagline}
        </p>

        {/* Use Case Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {distro.useCases.slice(0, 3).map((uc) => {
            const cfg = USE_CASE_CONFIG[uc];
            return (
              <span
                key={`uc-${distro.id}-${uc}`}
                className={`badge-use-case ${cfg.bg} ${cfg.color}`}
              >
                {cfg.label}
              </span>
            );
          })}
          {distro.useCases.length > 3 && (
            <span className="badge-use-case bg-muted text-muted-foreground">
              +{distro.useCases.length - 3}
            </span>
          )}
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <MemoryStick size={12} className="text-muted-foreground mb-1" />
            <span className="text-2xs font-semibold text-foreground tabular-nums font-mono">
              {ramLabel(distro.minRamMb)}
            </span>
            <span className="text-2xs text-muted-foreground">min RAM</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <HardDrive size={12} className="text-muted-foreground mb-1" />
            <span className="text-2xs font-semibold text-foreground tabular-nums font-mono">
              {distro.minStorageGb}GB
            </span>
            <span className="text-2xs text-muted-foreground">min disk</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Cpu size={12} className="text-muted-foreground mb-1" />
            <span className="text-2xs font-semibold text-foreground tabular-nums font-mono">
              {distro.minCpuCores}c
            </span>
            <span className="text-2xs text-muted-foreground">min CPU</span>
          </div>
        </div>

        {/* Rating + Release Model */}
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={distro.communityRating} />
          <Badge variant={distro.releaseModel === 'Rolling' ? 'accent' : distro.releaseModel === 'LTS' ? 'success' : 'muted'} size="sm">
            {distro.releaseModel}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <button
            onClick={onCompareToggle}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-all duration-150 px-2.5 py-1.5 rounded-lg ${
              isInCompare
                ? 'text-primary bg-primary-light' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isInCompare ? <CheckSquare size={13} /> : <Square size={13} />}
            {isInCompare ? 'Added' : 'Compare'}
          </button>
          <Link
            href="/distro-detail"
            className="ml-auto flex items-center gap-1 btn-primary text-xs px-3 py-1.5"
          >
            View Details
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DistroListRow({ distro, onCompareToggle, isInCompare }: { distro: Distro; onCompareToggle: () => void; isInCompare: boolean }) {
  return (
    <div
      className={`group bg-card rounded-xl border transition-all duration-150 card-shadow hover:card-shadow-md ${
        isInCompare ? 'border-primary primary-glow' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Logo */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: distro.logoColor }}
        >
          {distro.logoInitials}
        </div>

        {/* Name + Tags */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-foreground">{distro.name}</span>
            <span className="text-xs text-muted-foreground font-mono">v{distro.latestVersion}</span>
            {distro.isPopular && <Badge variant="primary" size="sm">Popular</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{distro.tagline}</p>
        </div>

        {/* Use Cases */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {distro.useCases.slice(0, 2).map((uc) => {
            const cfg = USE_CASE_CONFIG[uc];
            return (
              <span key={`list-uc-${distro.id}-${uc}`} className={`badge-use-case ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            );
          })}
        </div>

        {/* Specs */}
        <div className="hidden xl:flex items-center gap-4 shrink-0 text-xs font-mono text-muted-foreground">
          <span title="Min RAM">{ramLabel(distro.minRamMb)} RAM</span>
          <span title="Min storage">{distro.minStorageGb}GB disk</span>
        </div>

        {/* Rating */}
        <div className="hidden md:block shrink-0">
          <StarRating rating={distro.communityRating} />
        </div>

        {/* Compat Score */}
        <div className={`shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums ${compatColor(distro.compatibilityScore)}`}>
          {distro.compatibilityScore}%
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCompareToggle}
            className={`p-1.5 rounded-lg transition-all duration-150 ${
              isInCompare ? 'text-primary bg-primary-light' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isInCompare ? <CheckSquare size={15} /> : <Square size={15} />}
          </button>
          <Link
            href="/distro-detail"
            className="btn-primary text-xs px-3 py-1.5"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DistroResultsPanel() {
  const { filters, setFilters, toggleCompare } = useDistroFilter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading] = useState(false);

  const filteredDistros = useMemo(() => {
    let results = ALL_DISTROS.filter((d) => {
      if (d.minRamMb > filters.maxRam) return false;
      if (filters.maxStorage < 100 && d.minStorageGb > filters.maxStorage) return false;
      if (filters.architectures.length > 0 && !filters.architectures.some((a) => d.architectures.includes(a))) return false;
      if (filters.useCases.length > 0 && !filters.useCases.some((uc) => d.useCases.includes(uc))) return false;
      if (filters.releaseModels.length > 0 && !filters.releaseModels.includes(d.releaseModel)) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.tagline.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'compatibility': return b.compatibilityScore - a.compatibilityScore;
        case 'rating': return b.communityRating - a.communityRating;
        case 'ease': return b.easeOfUse - a.easeOfUse;
        case 'name': return a.name.localeCompare(b.name);
        case 'efficiency': return b.hardwareEfficiency - a.hardwareEfficiency;
        default: return 0;
      }
    });

    return results;
  }, [filters]);

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search distributions..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground hidden sm:block">Sort:</span>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
            className="text-xs font-semibold border border-border rounded-lg px-2.5 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value="compatibility">Compatibility</option>
            <option value="rating">Community Rating</option>
            <option value="ease">Ease of Use</option>
            <option value="efficiency">HW Efficiency</option>
            <option value="name">Name A–Z</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors duration-150 ${viewMode === 'grid' ? 'bg-primary-light text-primary' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors duration-150 ${viewMode === 'list' ? 'bg-primary-light text-primary' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {filteredDistros.length}
        </span>
        <span className="text-sm text-muted-foreground">
          distribution{filteredDistros.length !== 1 ? 's' : ''} found
        </span>
        {filters.maxRam < 16384 && (
          <span className="text-xs text-muted-foreground">
            · compatible with {ramLabel(filters.maxRam)} RAM
          </span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DistroCardSkeleton key={`skel-${i + 1}`} />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && filteredDistros.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {filteredDistros.map((distro) => (
              <DistroCard
                key={distro.id}
                distro={distro}
                onCompareToggle={() => toggleCompare(distro.id)}
                isInCompare={filters.compareIds.includes(distro.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDistros.map((distro) => (
              <DistroListRow
                key={distro.id}
                distro={distro}
                onCompareToggle={() => toggleCompare(distro.id)}
                isInCompare={filters.compareIds.includes(distro.id)}
              />
            ))}
          </div>
        )
      )}

      {/* Empty State */}
      {!isLoading && filteredDistros.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search size={28} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            No distributions match your filters
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            Try adjusting your RAM or storage requirements, or remove some use case filters to see more options.
          </p>
          <button
            onClick={() => setFilters((prev) => ({
              ...prev,
              maxRam: 16384,
              maxStorage: 100,
              architectures: [],
              useCases: [],
              releaseModels: [],
              searchQuery: '',
            }))}
            className="btn-outline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}