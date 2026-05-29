'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, LogOut, PlusCircle, ShieldCheck, X, Send, CheckCircle, Mail } from 'lucide-react'; 
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

interface TopbarProps {
  dict: any;
  lang: string;
}

export default function Topbar({ dict, lang }: TopbarProps) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Estados para controlar el Modal de no-usuarios
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Campos del formulario
  const [formEmail, setFormEmail] = useState('');
  const [formDistroName, setFormDistroName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formComments, setFormComments] = useState('');

  const textSignIn = dict?.topbar?.signIn || "Sign In";
  const textSignOut = dict?.topbar?.signOut || "Sign Out";
  const textSubmitDistro = dict?.topbar?.submitDistro || "Submit Distro";
  const textProfileTooltip = lang === 'es' ? "Editar ajustes del perfil" : "Edit profile settings";
  const textAdminTooltip = lang === 'es' ? "Panel de Administración" : "Admin Dashboard";

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setRole(data.role);
      } else {
        setRole('user'); 
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

  // Manejador del envío de correos para altas de no-usuarios
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Configuración de endpoint (Formspree o tu propia API local /api/send-email)
      const response = await fetch('https://formspree.io/f/tu_endpoint_formspree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nueva propuesta de distro (No Usuario): ${formDistroName}`,
          remitente: formEmail,
          nombre_distro: formDistroName,
          eslogan: formTagline,
          comentarios: formComments,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormEmail('');
        setFormDistroName('');
        setFormTagline('');
        setFormComments('');
      } else {
        alert(lang === 'es' ? 'Hubo un error al enviar el formulario.' : 'There was an error sending the form.');
      }
    } catch (error) {
      console.error('Email submit error:', error);
      alert(lang === 'es' ? 'Error de conexión.' : 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
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
              {role === 'admin' && (
                <Link
                  href={`/${lang}/admin`}
                  className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title={textAdminTooltip}
                >
                  <ShieldCheck size={18} className="animate-pulse" />
                </Link>
              )}

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

          {/* Botón dinámico para añadir distribuciones */}
          {user ? (
            /* Si el usuario está registrado, mantiene la ruta interna estándar */
            <Link
              href={`/${lang}/submit-distro`}
              className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              {textSubmitDistro}
            </Link>
          ) : (
            /* Si es un invitado externo (no logueado), abre el formulario modal por correo */
            <button
              onClick={() => { setIsModalOpen(true); setIsSuccess(false); }}
              className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              {textSubmitDistro}
            </button>
          )}
        </div>

      </div>

      {/* ─── MODAL DE PROPUESTAS POR CORREO ELECTRÓNICO (NO USUARIOS) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera del modal */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2 text-foreground font-black text-sm">
                <Mail size={16} className="text-primary" />
                {lang === 'es' ? 'Proponer Nueva Distribución' : 'Suggest New Distribution'}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 overflow-y-auto space-y-4">
              {isSuccess ? (
                <div className="text-center py-6 space-y-3 flex flex-col items-center justify-center">
                  <CheckCircle size={40} className="text-success animate-bounce" />
                  <h4 className="text-sm font-bold text-foreground">
                    {lang === 'es' ? '¡Propuesta enviada con éxito!' : 'Proposal submitted successfully!'}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    {lang === 'es' 
                      ? 'Revisaremos los detalles técnicos para validar su incorporación al ecosistema dinámico.' 
                      : 'We will review the technical details to validate its incorporation into the dynamic ecosystem.'}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-colors"
                  >
                    {lang === 'es' ? 'Cerrar ventana' : 'Close window'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === 'es' 
                      ? 'Envíanos los datos esenciales de la distro y nuestro equipo gestionará el alta manual tras validar los parámetros técnicos.' 
                      : 'Send us the essential distro data and our team will manage the manual registration after validating technical parameters.'}
                  </p>

                  {/* Campo Correo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Tu Correo de Contacto' : 'Your Contact Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Nombre Distro */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Nombre de la Distribución' : 'Distribution Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formDistroName}
                      onChange={(e) => setFormDistroName(e.target.value)}
                      placeholder="p.e. Pop!_OS, Debian"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Eslogan */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Eslogan Breve (Tagline)' : 'Short Tagline'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="p.e. Rendimiento impecable para desarrollo y contenedores."
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Detalles */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Requisitos estimados o comentarios' : 'Estimated requirements or comments'}
                    </label>
                    <textarea
                      rows={3}
                      value={formComments}
                      onChange={(e) => setFormComments(e.target.value)}
                      placeholder="Base del sistema, arquitectura CPU, RAM mínima necesaria, enlaces oficiales..."
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none transition-all"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/45">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-border bg-card text-foreground font-semibold rounded-xl text-xs hover:bg-muted transition-colors"
                    >
                      {lang === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <Send size={12} />
                      )}
                      {lang === 'es' ? 'Enviar Propuesta' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
