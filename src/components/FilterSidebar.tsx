'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

// Mantenemos la interfaz original intacta para que el padre no rompa, 
// y añadimos de forma segura los nuevos campos opcionales para evitar problemas de tipos.
interface FilterState {
  ram: number;
  cpu: number;
  storage: string | number; // Adaptado para aceptar cadenas como 'all' o '20GB'
  useCase: string;
  difficulty: string;
  architecture?: string;
  releaseModel?: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  dict: any;
  lang: string;
}

// Diccionario de traducción interno para los textos estáticos y dinámicos
const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: 'Filtros',
    minRam: 'RAM MÍNIMA',
    availableRam: 'RAM disponible de tu PC',
    ramShow: 'Muestra distros que corren con {ram} o menos',
    storage: 'ALMACENAMIENTO DISPONIBLE',
    minStorage: 'Espacio mínimo en disco',
    anyStorage: 'Cualquiera',
    orLess: 'o menos',
    arch: 'ARQUITECTURA DE CPU',
    useCase: 'CASO DE USO',
    releaseModel: 'MODELO DE LANZAMIENTO',
    all: 'Todos',
    anyArch: 'Cualquier arquitectura',
    anyRelease: 'Cualquier modelo',
    // Casos de uso / Dificultades mapeadas de base de datos a interfaz
    all_val: 'Todos',
    general: 'Uso General',
    gaming: 'Juegos',
    developer: 'Desarrollo',
    server: 'Servidor',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  },
  en: {
    title: 'Filters',
    minRam: 'MINIMUM RAM',
    availableRam: 'Available RAM on your PC',
    ramShow: 'Shows distros that run on {ram} or less',
    storage: 'AVAILABLE STORAGE',
    minStorage: 'Minimum storage space',
    anyStorage: 'Any storage',
    orLess: 'or less',
    arch: 'CPU ARCHITECTURE',
    useCase: 'USE CASE',
    releaseModel: 'RELEASE MODEL',
    all: 'All',
    anyArch: 'Any architecture',
    anyRelease: 'Any model',
    // Mapeos
    all_val: 'All',
    general: 'Daily Driver',
    gaming: 'Gaming',
    developer: 'Development',
    server: 'Servers',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  }
};

export default function FilterSidebar({ filters, setFilters, dict, lang }: FilterSidebarProps) {
  // Fallback seguro usando las traducciones internas si el dict de Next-Intl viene vacío
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  // Opciones de filtrado mapeadas a las que maneja el motor de búsqueda actual
  const storageOptions = ['all', '8GB', '20GB', '30GB', '50GB', '100GB'];
  const architectures = ['all', 'AMD64 / x86-64', 'ARM64', 'x86 (32-bit)', 'RISC-V'];
  
  // Mantenemos las claves en minúscula tal cual estaban en tu select anterior ('general', 'gaming', 'developer', 'server')
  const useCases = ['all', 'general', 'gaming', 'developer', 'server'];
  
  // Usamos la propiedad 'difficulty' mapeando los valores originales ('beginner', 'intermediate', 'advanced')
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  
  const releaseModels = ['all', 'Rolling', 'LTS', 'Fixed', 'Semi-rolling'];

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatRamLabel = (gb: number) => {
    if (gb === 0) return t.all;
    if (gb < 1) return `${gb * 1024}MB`;
    return `${gb}GB`;
  };

  return (
    <div className="w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-foreground">
      {/* Cabecera */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-muted/20">
        <SlidersHorizontal size={16} className="text-primary" />
        <h2 className="text-sm font-bold tracking-tight">{dict?.title || t.title}</h2>
      </div>

      <div className="p-5 space-y-6">
        {/* 1. RAM MÍNIMA (Controlador deslizante) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {dict?.ram || t.minRam}
          </span>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">{t.availableRam}</span>
              <span className="font-mono font-bold text-primary">{formatRamLabel(filters.ram)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="2"
              value={filters.ram}
              onChange={(e) => updateFilter('ram', Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
              <span>{t.all}</span>
              <span>16GB</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic pt-1">
              {filters.ram > 0 ? t.ramShow.replace('{ram}', `${filters.ram}GB`) : t.all}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* 2. ALMACENAMIENTO (Botones de lista vertical) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {t.storage}
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-col gap-1">
              {storageOptions.map((opt) => {
                const isSelected = (filters.storage || 'all') === opt;
                return (
                  <button
                    key={`store-${opt}`}
                    type="button"
                    onClick={() => updateFilter('storage', opt)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt === 'all' ? t.anyStorage : `${opt} ${t.orLess}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* 3. ARQUITECTURA DE CPU (Radio Buttons) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {t.arch}
          </span>
          <div className="grid grid-cols-1 gap-2">
            {architectures.map((arch) => {
              const isSelected = (filters.architecture || 'all') === arch;
              return (
                <label
                  key={`arch-${arch}`}
                  className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer py-0.5"
                >
                  <input
                    type="radio"
                    name="architecture"
                    checked={isSelected}
                    onChange={() => updateFilter('architecture', arch)}
                    className="w-3.5 h-3.5 rounded-full border-muted bg-card accent-primary text-primary focus:ring-0 focus:ring-offset-0"
                  />
                  <span className={isSelected ? 'text-foreground font-bold' : ''}>
                    {arch === 'all' ? t.anyArch : arch}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <hr className="border-border" />

        {/* 4. CASO DE USO (Píldoras redondeadas modernas de selección rápida) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {dict?.useCase || t.useCase}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {useCases.map((uc) => {
              const isSelected = filters.useCase === uc;
              return (
                <button
                  key={`uc-${uc}`}
                  type="button"
                  onClick={() => updateFilter('useCase', uc)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                  }`}
                >
                  {uc === 'all' ? t.all : (t[uc] || uc)}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border" />

        {/* 5. EXPERIENCIA LINUX / DIFICULTAD (Píldoras redondeadas) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {dict?.difficulty || t.difficulty}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {difficulties.map((diff) => {
              const isSelected = filters.difficulty === diff;
              return (
                <button
                  key={`diff-${diff}`}
                  type="button"
                  onClick={() => updateFilter('difficulty', diff)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                  }`}
                >
                  {diff === 'all' ? t.all : (t[diff] || diff)}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border" />

        {/* 6. MODELO DE LANZAMIENTO (Radio Buttons) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            {t.releaseModel}
          </span>
          <div className="grid grid-cols-1 gap-2">
            {releaseModels.map((model) => {
              const isSelected = (filters.releaseModel || 'all') === model;
              return (
                <label
                  key={`model-${model}`}
                  className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer py-0.5"
                >
                  <input
                    type="radio"
                    name="releaseModel"
                    checked={isSelected}
                    onChange={() => updateFilter('releaseModel', model)}
                    className="w-3.5 h-3.5 rounded-full border-muted bg-card accent-primary text-primary focus:ring-0 focus:ring-offset-0"
                  />
                  <span className={isSelected ? 'text-foreground font-bold' : ''}>
                    {model === 'all' ? t.anyRelease : model}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
