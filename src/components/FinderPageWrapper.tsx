'use client';

import React, { useState } from 'react';
import FilterSidebar from './FilterSidebar';
import DistroResultsPanel from './DistroResultsPanel';
import CompareBar from './CompareBar';
import { useDistroFilter } from './useDistroFilter';
import { distros as initialDistros } from './distroData'; 

interface FinderPageWrapperProps {
  dict: any;
  lang: string;
}

export default function FinderPageWrapper({ dict, lang }: FinderPageWrapperProps) {
  // Fallbacks de traducciones para evitar que la app rompa si faltan claves en el JSON
  const finderDict = dict?.finder || {};
  const searchPlaceholder = finderDict?.searchPlaceholder || (lang === 'es' ? 'Busca tu distribución Linux ideal...' : 'Search your ideal Linux distribution...');

  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom hook para gestionar los filtros de hardware/uso (adaptar según tu lógica real)
  const { 
    filters, 
    setFilters, 
    filteredDistros 
  } = useDistroFilter(initialDistros, searchQuery);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
      
      {/* Barra de búsqueda superior */}
      <div className="mb-8 max-w-2xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Contenedor del Buscador: Filtros + Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Panel Izquierdo: Filtros de Hardware */}
        <div className="lg:col-span-1 sticky top-20">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            dict={dict?.filters} 
            lang={lang} 
          />
        </div>

        {/* Panel Derecho: Lista de Resultados */}
        <div className="lg:col-span-3">
          <DistroResultsPanel 
            distros={filteredDistros} 
            dict={dict?.results} 
            lang={lang} 
          />
        </div>

      </div>

      {/* Barra inferior flotante de comparación de distros */}
      <CompareBar dict={dict?.compare} lang={lang} />
      
    </div>
  );
}
