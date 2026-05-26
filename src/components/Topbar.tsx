'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, LogOut, PlusCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

export default function Topbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Verificar si hay una sesión activa al cargar la página
    const getActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getActiveSession();

    // 2. Escuchar cambios de estado en tiempo real (Login, Logout, Registro confirmado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/'; // Redirige a la home y limpia los estados
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Lado Izquierdo: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-extrabold text-base text-foreground">
            Linux<span className="text-primary">Match</span>
          </span>
        </Link>

        {/* Lado Derecho: Controles dinámicos de usuario */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Esqueleto animado mientras Supabase responde
            <div className="h-8 w-20 animate-pulse bg-muted rounded-lg" />
          ) : user ? (
            /* ─── USUARIO LOGUEADO ─── */
            <>
              {/* Bloque con el Username */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border">
                <User size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  @{user.user_metadata?.username || 'user'}
                </span>
              </div>

              {/* Botón de Logout */}
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-danger rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            /* ─── INVITADO (NO LOGUEADO) ─── */
            <Link
              href="/sign-up-login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Botón para añadir distribuciones */}
          <Link
            href={user ? "/submit-distro" : "/sign-up-login"}
            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            Submit Distro
          </Link>
        </div>

      </div>
    </header>
  );
}
