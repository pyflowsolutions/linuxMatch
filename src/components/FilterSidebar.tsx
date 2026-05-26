'use client';

import React from 'react';

interface FilterState {
  ram: number;
  cpu: number;
  storage: number;
  useCase: string;
  difficulty: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  dict: any;
  lang: string;
}

export default function FilterSidebar({ filters, setFilters, dict, lang }: FilterSidebarProps) {
  // Diccionario con fallbacks seguros en español/inglés
  const t = {
    title: dict?.title || (lang === 'es' ? 'Filtros de Hardware' : 'Hardware Filters'),
    ram: dict?.ram || (lang === 'es' ? 'RAM de tu PC' : 'Your PC RAM'),
    useCase: dict?.useCase || (lang === 'es' ? 'Uso Principal' : 'Primary Use'),
    difficulty: dict?.difficulty || (lang === 'es' ? 'Experiencia Linux' : 'Linux Experience'),
    all: lang === 'es' ? 'Todos' : 'All',
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6 shadow-sm">
      <h3 className="font-extrabold text-sm tracking-tight text-foreground uppercase">
        {t.title}
      </h3>
      
      {/* Filtro de RAM */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground flex justify-between">
          <span>{t.ram}</span>
          <span className="text-primary font-bold">
            {filters.ram > 0 ? `${filters.ram} GB` : t.all}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="16"
          step="2"
          value={filters.ram}
          onChange={(e) => updateFilter('ram', Number(e.target.value))}
          className="w-full accent-primary bg-muted h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Filtro de Caso de Uso */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">{t.useCase}</label>
        <select
          value={filters.useCase}
          onChange={(e) => updateFilter('useCase', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">{t.all}</option>
          <option value="general">{lang === 'es' ? 'Uso General' : 'Daily Driver'}</option>
          <option value="gaming">Gaming</option>
          <option value="developer">{lang === 'es' ? 'Desarrollo' : 'Development'}</option>
          <option value="server">{lang === 'es' ? 'Servidores' : 'Servers'}</option>
        </select>
      </div>

      {/* Filtro de Dificultad */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">{t.difficulty}</label>
        <select
          value={filters.difficulty}
          onChange={(e) => updateFilter('difficulty', e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">{t.all}</option>
          <option value="beginner">{lang === 'es' ? 'Principiante' : 'Beginner'}</option>
          <option value="intermediate">{lang === 'es' ? 'Intermedio' : 'Intermediate'}</option>
          <option value="advanced">{lang === 'es' ? 'Avanzado' : 'Advanced'}</option>
        </select>
      </div>
    </div>
  );
}
