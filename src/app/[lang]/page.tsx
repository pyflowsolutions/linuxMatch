'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Distro } from '@/components/distroData';
// Importa tus componentes de Filtros o Tarjetas aquí...

export default function HomeSearchPage() {
  const supabase = createClient();
  
  // Estado dinámico para almacenar SÓLO las distribuciones reales de la BD
  const [distros, setDistros] = useState<Distro[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros (mantén los que ya tengas configurados)
  const [searchQuery, setSearchQuery] = useState('');
  const [ramFilter, setRamFilter] = useState(16);
  // ... resto de tus estados de filtros

  // CARGA DINÁMICA DE LA BASE DE DATOS
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

  // LÓGICA DE FILTRADO (Aplica sobre el estado 'distros' que viene de Supabase)
  const filteredDistros = distros.filter(distro => {
    const matchesSearch = distro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          distro.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de RAM: Mostrar solo si la distro requiere MENOS o IGUAL RAM de la disponible
    const matchesRam = (distro.minRam || 0) <= ramFilter;

    return matchesSearch && matchesRam;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tu input de búsqueda superior */}
      <input 
        type="text" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="Busca tu distribución Linux ideal..."
        className="... tus clases de diseño ..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Render de tus Filtros a la izquierda */}
        <div className="lg:col-span-1">
          {/* Componente o inputs de Filtros aquí */}
        </div>

        {/* CONTENEDOR DE TARJETAS DINÁMICAS */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDistros.length === 0 ? (
            <div className="col-span-2 text-center p-12 text-muted-foreground">
              No se han encontrado distribuciones que cumplan los criterios seleccionados.
            </div>
          ) : (
            filteredDistros.map((distro) => (
              <div key={distro.id} className="bg-card border border-border p-5 rounded-2xl space-y-4 relative">
                {/* Cabecera de la Tarjeta */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black">{distro.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{distro.tagline}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                    {distro.useCases?.[0] || 'General'}
                  </span>
                </div>

                {/* Especificaciones Técnicas cortas */}
                <div className="flex gap-4 text-[11px] text-muted-foreground border-t border-border/45 pt-3">
                  <span>📦 {distro.minRam}GB RAM</span>
                  <span>⚙️ {distro.minCpuCores} CPU</span>
                  <span>💾 {distro.minStorage}GB</span>
                </div>

                {/* Enlace dinámico usando el ID real de Supabase */}
                <div className="text-right pt-2">
                  <a 
                    href={`/${lang}/distro-detail?id=${distro.id}`}
                    className="text-primary font-bold text-xs hover:underline inline-flex items-center gap-1"
                  >
                    Ver detalles ➔
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
