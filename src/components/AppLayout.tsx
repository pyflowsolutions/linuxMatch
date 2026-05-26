import React from 'react';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  dict: any;
  lang: string;
}

export default function AppLayout({ children, dict, lang }: AppLayoutProps) {
  // Carga las etiquetas del footer desde el archivo JSON o asigna un fallback por defecto si no existen
  const footerSubtitle = dict?.footer?.subtitle || "The Linux distribution compatibility database";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Pasamos el diccionario y el tag del idioma al componente superior */}
      <Topbar dict={dict} lang={lang} />
      
      <main className="flex-1 w-full">
        {children}
      </main>
      
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Linux<span className="text-primary">Match</span>
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">
                {footerSubtitle}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2026 LinuxMatch</span>
              <span className="hidden sm:block">·</span>
              <span className="hidden sm:block">Open Source</span>
              <span className="hidden sm:block">·</span>
              <span className="hidden sm:block">Community-driven</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}