'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, LogOut, PlusCircle, ShieldCheck } from 'lucide-react'; // Añadimos ShieldCheck para el icono de Admin
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

interface TopbarProps {
  dict: any;
  lang: string;
}

export default function Topbar({ dict, lang }: TopbarProps) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null); // Estdo local para controlar el rol
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const textSignIn = dict?.topbar?.signIn || "Sign In";
  const textSignOut = dict?.topbar?.signOut || "Sign Out";
  const textSubmitDistro = dict?.topbar?.submitDistro || "Submit Distro";
  const textProfileTooltip = lang === 'es' ? "Editar ajustes del perfil" : "Edit profile settings";
  const textAdminTooltip = lang === 'es' ? "Panel de Administración" : "Admin Dashboard";

  useEffect(() => {
    // Función auxiliar para obtener el rol desde la tabla pública de perfiles
    const fetchUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setRole(data.role);
      } else {
        setRole('user'); // Fallback seguro
      }
    };

    const getActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      }
      setLoading(false);
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = `/${lang}`;
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Lado Izquierdo: Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-extrabold text-base text-foreground">
            Linux<span className="text-primary">Match</span>
          </span>
        </Link>

        {/* Lado Derecho: Controles dinámicos */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-lg" />
          ) : user ? (
            /* ─── USUARIO LOGUEADO ─── */
            <>
              {/* 🛡️ ACCESO PRIVADO: Solo si el rol obtenido de Supabase es 'admin' */}
              {role === 'admin' && (
                <Link
                  href={`/${lang}/admin`}
                  className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title={textAdminTooltip}
                >
                  <ShieldCheck size={18} className="animate-pulse" />
                </Link>
              )}

              {/* Bloque clickable que redirige a la edición del perfil */}
              <Link 
                href={`/${lang}/profile`} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors group"
                title={textProfileTooltip}
              >
                <User size={14} className="text-primary group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  @{user.user_metadata?.username || 'user'}
                </span>
              </Link>

              {/* Botón de Logout */}
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-danger rounded-lg transition-colors"
                title={textSignOut}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            /* ─── INVITADO (NO LOGUEADO) ─── */
            <Link
              href={`/${lang}/sign-up-login`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {textSignIn}
            </Link>
          )}

          {/* Botón para añadir distribuciones */}
          <Link
            href={user ? `/${lang}/submit-distro` : `/${lang}/sign-up-login`}
            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            {textSubmitDistro}
          </Link>
        </div>

      </div>
    </header>
  );
}
