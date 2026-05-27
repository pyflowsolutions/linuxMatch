'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Distro, USE_CASE_CONFIG } from '@/components/distroData';

interface HomeSearchPageProps {
  params: {
    lang: string;
  };
}

export default function HomeSearchPage({ params }: HomeSearchPageProps) {
  const lang = params?.lang || 'es'; 
  const supabase = createClient();
  
  const [distros, setDistros] = useState<Distro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [ramFilter, setRamFilter] = useState(16);

  // Evitamos problemas de hidratación en Next.js (el error removeChild)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // CARGA DINÁMICA DESDE SUPABASE
  useEffect(() => {
    async function loadActiveDistros() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('distributions')
          .select(`
            id, name, tagline, logoInitials:logo_initials, logoColor:logo_color,
            minRam:min_ram, minStorage:min_storage, minCpuCores:min_cpu_cores,
            releaseModel:release_model, cpuArchitecture:cpu_architecture,
            useCases:use_cases, descriptionEs:description_es, descriptionEn:description_en,
            latestVersion:latest_version, releaseDate:release_date, basedOn:based_on,
            easeOfUse:ease_of_use, hardwareEfficiency:hardware_efficiency,
            stabilityScore:stability_score, compatibilityScore:compatibility_score,
            communityRating:community_rating
          `);

        if (!error && data) {
          setDistros(data as Distro[]);
        }
      } catch (err) {
        console.error("Error al sincronizar el catálogo dinámico:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActiveDistros();
  }, [supabase]);

  // LÓGICA DE FILTRADO
  const filteredDistros = distros.filter(distro => {
    const distroName = distro.name?.toLowerCase() || '';
    const distroTagline = distro.tagline?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = distroName.includes(query) || distroTagline.includes(query);
    const matchesRam = (distro.minRam || 0) <= ramFilter;

    return matchesSearch && matchesRam;
  });

  if (!isMounted || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground animate-pulse">Cargando ecosistema Linux...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Input de búsqueda superior */}
      <input 
        type="text" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="Busca tu distribución Linux ideal..."
        className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Render de Filtros a la izquierda */}
        <div className="lg:col-span-1 bg-card border border-border p-4 rounded-2xl h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Filtros</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>RAM Mínima:</span>
              <span className="text-primary font-mono font-bold">{ramFilter} GB</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="64" 
              value={ramFilter} 
              onChange={(e) => setRamFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* CONTENEDOR DE TARJETAS DINÁMICAS */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDistros.length === 0 ? (
            <div className="col-span-2 text-center p-12 text-muted-foreground bg-card rounded-2xl border border-border text-sm">
              No se han encontrado distribuciones que cumplan los criterios seleccionados.
            </div>
          ) : (
            filteredDistros.map((distro) => {
              // Salvavidas ultra seguro para extraer el caso de uso sin romper nunca
              const rawUseCase = Array.isArray(distro.useCases) ? distro.useCases[0] : (distro.useCases || 'General');
              const useCaseKey = String(rawUseCase).toLowerCase();
              
              // Buscamos en tu diccionario o aplicamos un estilo neutro si no existe la clave 'beginner'
              const badgeStyle = USE_CASE_CONFIG[useCaseKey] || USE_CASE_CONFIG[String(rawUseCase)] || {
                bg: 'bg-primary/10',
                color: 'text-primary',
                label: String(rawUseCase)
              };

              return (
                <div key={distro.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between space-y-4 relative hover:shadow-md transition-shadow">
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-sm font-black text-foreground">{distro.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{distro.tagline}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${badgeStyle.bg} ${badgeStyle.color}`}>
                      {badgeStyle.label}
                    </span>
                  </div>

                  {/* Especificaciones Técnicas cortas */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t border-border/45 pt-3">
                    <span>📦 <strong className="text-foreground">{distro.minRam || 0}GB</strong> RAM</span>
                    <span>⚙️ <strong className="text-foreground">{distro.minCpuCores || 0}</strong> CPU</span>
                    <span>💾 <strong className="text-foreground">{distro.minStorage || 0}GB</strong> Disk</span>
                  </div>

                  {/* Enlace dinámico usando el ID exacto */}
                  <div className="text-right pt-2 border-t border-border/20">
                    <a 
                      href={`/${lang}/distro-detail?id=${encodeURIComponent(distro.id)}`}
                      className="text-primary font-bold text-xs hover:underline inline-flex items-center gap-1"
                    >
                      Ver detalles ➔
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
