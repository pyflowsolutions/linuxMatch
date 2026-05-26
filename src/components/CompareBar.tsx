'use client';

import React from 'react';

interface CompareBarProps {
  dict: any;
  lang: string;
}

export default function CompareBar({ dict, lang }: CompareBarProps) {
  // Componente listo para acoplar la lógica de comparación en el futuro
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100%-2rem)]">
      {/* Contenedor vacío por ahora para evitar problemas visuales */}
    </div>
  );
}
