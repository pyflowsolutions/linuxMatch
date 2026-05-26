import React from 'react';
import { getDictionary } from './dictionaries';
// Corregido: Ahora apunta a la carpeta de componentes unificada en la raíz
import FinderPageWrapper from '@/components/FinderPageWrapper';

interface PageProps {
  params: Promise<{ lang: 'es' | 'en' }>;
}

export default async function DistrFinderPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Pasamos el diccionario y el idioma actual al buscador principal.
        Eliminamos <AppLayout> de aquí porque el layout.tsx de la carpeta [lang] 
        ya se encarga de envolver de forma global toda la página.
      */}
      <FinderPageWrapper dict={dict} lang={lang} />
    </div>
  );
}
