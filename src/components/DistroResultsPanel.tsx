'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, HardDrive, Layers } from 'lucide-react';

interface Distro {
  id: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  minRam: number;
  minCpuCores: number;
  minStorage: number;
  useCase: string;
  difficulty: string;
}

interface DistroResultsPanelProps {
  distros: Distro[];
  dict: any;
  lang: string;
}

export default function DistroResultsPanel({ distros, dict, lang }: DistroResultsPanelProps) {
  const noResults = dict?.noResults || (lang === 'es' ? 'No se encontraron distribuciones coincidentes.' : 'No matching distributions found.');
  const viewSpecs = lang === 'es' ? 'Ver detalles' : 'View specs';

  if (distros.length === 0) {
    return (
      <div className="border border-dashed border-border bg-card rounded-2xl p-12 text-center">
        <p className="text-sm text-muted-foreground font-medium">{noResults}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {distros.map((distro) => (
        <div 
          key={distro.id} 
          className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {distro.name}
              </h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                distro.difficulty === 'beginner' ? 'bg-success/10 text-success' :
                distro.difficulty === 'intermediate' ? 'bg-warning/10 text-warning' : 
                'bg-danger/10 text-danger'
              }`}>
                {distro.difficulty}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
              {lang === 'es' ? distro.descriptionEs : distro.descriptionEn}
            </p>
          </div>

          <div className="border-t border-border pt-4 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Layers size={13} /> {distro.minRam}GB</span>
              <span className="flex items-center gap-1"><Cpu size={13} /> {distro.minCpuCores} CPU</span>
              <span className="flex items-center gap-1"><HardDrive size={13} /> {distro.minStorage}GB</span>
            </div>
            
            <Link 
              href={`/${lang}/distro-detail?id=${distro.id}`} 
              className="text-primary hover:underline font-bold text-xs"
            >
              {viewSpecs} &rarr;
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
