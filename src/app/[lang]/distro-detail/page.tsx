import React from 'react';
import DistroDetailContent from './components/DistroDetailContent';

interface PageProps {
  params: Promise<{ lang: 'es' | 'en' }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function DistroDetailPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const { id } = await searchParams; // Captura el ?id=ubuntu de la URL

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Pasamos el id de la distro elegida y el idioma actual */}
      <DistroDetailContent distroId={id || ''} lang={lang} />
    </div>
  );
}
