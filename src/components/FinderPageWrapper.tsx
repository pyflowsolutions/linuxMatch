'use client';

import React, { useState, useMemo } from 'react';
import FilterSidebar from './FilterSidebar';
import DistroResultsPanel from './DistroResultsPanel';
import CompareBar from './CompareBar';
import { FilterProvider, useDistroFilter } from '@/components/useDistroFilter';
import { distros as initialDistros } from './distroData';

interface FinderPageWrapperProps {
  dict: any;
  lang: string;
}

// 1. Creamos el componente interno que CONSUME el contexto sin problemas
function FinderPageContent({ dict, lang }: FinderPageWrapperProps) {
  const finderDict = dict?.finder || {};
  const searchPlaceholder = finderDict?.searchPlaceholder || 
    (lang === 'es' ? 'Busca tu distribución Linux ideal...' : 'Search your ideal Linux distribution...');

  const [searchQuery, setSearchQuery] = useState('');
  
  // Extraemos las funciones y estados del Contexto global
  const { filters, setFilters } = useDistroFilter();

  // 2. Filtramos las distros localmente usando useMemo para que sea súper rápido
  const filteredDistros = useMemo(() => {
    return initialDistros.filter((distro) => {
      // Filtro por barra de búsqueda (nombre o descripción)
      const matchesSearch = 
        distro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (distro.description && distro.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtro por hardware (RAM)
      const matchesRam = distro.requirements?.ram ? distro.requirements.ram <= filters.maxRam : true;
      
      // Filtro por hardware (Almacenamiento)
      const matchesStorage = distro.requirements?.storage ? distro.requirements.storage <= filters.maxStorage : true;

      // Filtro por Arquitecturas (si hay seleccionadas)
      const matchesArch = filters.architectures.length === 0 || 
        filters.architectures.some(arch => distro.architectures?.includes(arch));

      // Filtro por Casos de Uso (si hay seleccionados)
      const matchesUseCase = filters.useCases.length === 0 || 
        filters.useCases.some(uc => distro.useCases?.includes(uc));

      return matchesSearch && matchesRam && matchesStorage && matchesArch && matchesUseCase;
    });
  }, [searchQuery, filters]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
      <div className="mb-8 max-w-2xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-20">
          <FilterSidebar filters={filters} setFilters={setFilters} dict={dict?.filters} lang={lang} />
        </div>
        <div className="lg:col-span-3">
          <DistroResultsPanel distros={filteredDistros} dict={dict?.results} lang={lang} />
        </div>
      </div>

      <CompareBar dict={dict?.compare} lang={lang} />
    </div>
  );
}

// 3. El export principal envuelve todo con el FilterProvider
export default function FinderPageWrapper(props: FinderPageWrapperProps) {
  return (
    <FilterProvider>
      <FinderPageContent {...props} />
    </FilterProvider>
  );
}
