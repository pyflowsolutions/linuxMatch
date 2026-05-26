'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { UseCase, Architecture, USE_CASE_CONFIG } from './distroData';
import { useDistroFilter } from './useDistroFilter';

const USE_CASES: UseCase[] = [
  'Beginner-Friendly',
  'Gaming',
  'Development',
  'Privacy',
  'Server',
  'Education',
  'Multimedia',
  'Lightweight',
];

const ARCHITECTURES: Architecture[] = ['amd64', 'arm64', 'x86', 'riscv'];

const ARCH_LABELS: Record<Architecture, string> = {
  amd64: 'AMD64 / x86-64',
  arm64: 'ARM64',
  x86: 'x86 (32-bit)',
  riscv: 'RISC-V',
};

const RAM_OPTIONS = [512, 1024, 2048, 4096, 8192, 16384];
const STORAGE_OPTIONS = [8, 20, 30, 50, 100];

function ramLabel(mb: number) {
  return mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`;
}

export default function FilterSidebar() {
  const { filters, setFilters, resetFilters, activeFilterCount } = useDistroFilter();
  const [sectionsOpen, setSectionsOpen] = useState({
    ram: true,
    storage: true,
    arch: true,
    useCase: true,
    releaseModel: true,
  });

  const toggleSection = (key: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleUseCase = (uc: UseCase) => {
    setFilters((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(uc)
        ? prev.useCases.filter((u) => u !== uc)
        : [...prev.useCases, uc],
    }));
  };

  const toggleArch = (arch: Architecture) => {
    setFilters((prev) => ({
      ...prev,
      architectures: prev.architectures.includes(arch)
        ? prev.architectures.filter((a) => a !== arch)
        : [...prev.architectures, arch],
    }));
  };

  const toggleReleaseModel = (model: string) => {
    setFilters((prev) => ({
      ...prev,
      releaseModels: prev.releaseModels.includes(model)
        ? prev.releaseModels.filter((m) => m !== model)
        : [...prev.releaseModels, model],
    }));
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <div className="bg-card rounded-xl border border-border card-shadow sticky top-20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-2xs font-bold tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors duration-150"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        <div className="p-4 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
          {/* RAM Section */}
          <FilterSection
            title="Minimum RAM"
            open={sectionsOpen.ram}
            onToggle={() => toggleSection('ram')}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available RAM</span>
                <span className="text-xs font-semibold text-primary font-mono tabular-nums">
                  {ramLabel(filters.maxRam)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={RAM_OPTIONS.length - 1}
                value={RAM_OPTIONS.indexOf(filters.maxRam) === -1 ? RAM_OPTIONS.length - 1 : RAM_OPTIONS.indexOf(filters.maxRam)}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    maxRam: RAM_OPTIONS[parseInt(e.target.value)],
                  }));
                }}
                className="w-full"
              />
              <div className="flex justify-between text-2xs text-muted-foreground/70 font-mono">
                <span>512MB</span>
                <span>16GB</span>
              </div>
              <p className="text-2xs text-muted-foreground">
                Shows distros that run on {ramLabel(filters.maxRam)} or less
              </p>
            </div>
          </FilterSection>

          {/* Storage Section */}
          <FilterSection
            title="Available Storage"
            open={sectionsOpen.storage}
            onToggle={() => toggleSection('storage')}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Minimum storage</span>
                <span className="text-xs font-semibold text-primary font-mono tabular-nums">
                  {filters.maxStorage}GB
                </span>
              </div>
              {STORAGE_OPTIONS.map((gb) => (
                <button
                  key={`storage-${gb}`}
                  onClick={() => setFilters((prev) => ({ ...prev, maxStorage: gb }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    filters.maxStorage === gb
                      ? 'bg-primary-light text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {gb}GB or less
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Architecture Section */}
          <FilterSection
            title="CPU Architecture"
            open={sectionsOpen.arch}
            onToggle={() => toggleSection('arch')}
          >
            <div className="space-y-1.5">
              {ARCHITECTURES.map((arch) => (
                <label
                  key={`arch-${arch}`}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.architectures.includes(arch)}
                      onChange={() => toggleArch(arch)}
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                        filters.architectures.includes(arch)
                          ? 'bg-primary border-primary' :'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {filters.architectures.includes(arch) && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors font-mono">
                    {ARCH_LABELS[arch]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Use Case Section */}
          <FilterSection
            title="Use Case"
            open={sectionsOpen.useCase}
            onToggle={() => toggleSection('useCase')}
          >
            <div className="flex flex-wrap gap-1.5">
              {USE_CASES.map((uc) => {
                const cfg = USE_CASE_CONFIG[uc];
                const active = filters.useCases.includes(uc);
                return (
                  <button
                    key={`uc-${uc}`}
                    onClick={() => toggleUseCase(uc)}
                    className={`filter-chip ${active ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Release Model */}
          <FilterSection
            title="Release Model"
            open={sectionsOpen.releaseModel}
            onToggle={() => toggleSection('releaseModel')}
          >
            <div className="space-y-1.5">
              {['Rolling', 'LTS', 'Fixed', 'Semi-rolling'].map((model) => (
                <label
                  key={`model-${model}`}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.releaseModels.includes(model)}
                      onChange={() => toggleReleaseModel(model)}
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                        filters.releaseModels.includes(model)
                          ? 'bg-primary border-primary' :'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {filters.releaseModels.includes(model) && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {model}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}