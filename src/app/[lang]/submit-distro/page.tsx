'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, PlusCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface DistroFormData {
  name: string;
  base: string;
  desktopEnvironment: string;
  architecture: string;
  description: string;
  websiteUrl?: string;
}

export default function SubmitDistroPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DistroFormData>();

  // Verificar si el usuario está logueado para poder añadir distros
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase.auth]);

  const onSubmit = async (data: DistroFormData) => {
    setIsSubmitting(true);

    // Insertar la nueva distribución en la tabla 'distros' de Supabase
    const { error } = await supabase.from('distros').insert([
      {
        name: data.name,
        base: data.base,
        desktop_environment: data.desktopEnvironment,
        architecture: data.architecture,
        description: data.description,
        website_url: data.websiteUrl || null,
        user_id: user.id, // Guardamos qué usuario la ha subido
      },
    ]);

    if (error) {
      toast.error(`Error al añadir la distro: ${error.message}`);
    } else {
      toast.success('¡Distribución añadida con éxito para revisión! 🐧');
      router.push('/'); // Redirigir al inicio o al panel principal
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="text-danger mb-2" size={40} />
        <h2 className="text-lg font-bold">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground">Debes iniciar sesión para poder sugerir o dar de alta una nueva distribución.</p>
        <Link href="/sign-up-login" className="btn-primary mt-4">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 my-6 sm:my-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={13} /> Volver al Inicio
      </Link>

      <div className="bg-card rounded-2xl border border-border card-shadow p-6">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-extrabold text-foreground mb-1">Añadir Nueva Distribución</h1>
          <p className="text-sm text-muted-foreground">Colabora con la comunidad registrando un nuevo sistema operativo en la base de datos.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nombre de la Distro */}
          <div>
            <label htmlFor="distro-name" className="block text-xs font-semibold text-foreground mb-1.5">
              Nombre de la Distribución *
            </label>
            <input
              id="distro-name"
              type="text"
              placeholder="Ej: Ubuntu, Arch Linux, Fedora"
              className={`input-field ${errors.name ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          {/* Base de la distribución */}
          <div>
            <label htmlFor="distro-base" className="block text-xs font-semibold text-foreground mb-1.5">
              Base oficial *
            </label>
            <input
              id="distro-base"
              type="text"
              placeholder="Ej: Debian, Arch, Independent, RHEL"
              className={`input-field ${errors.base ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
              {...register('base', { required: 'La base del sistema es obligatoria' })}
            />
            {errors.base && <p className="mt-1 text-xs text-danger">{errors.base.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Entorno de Escritorio */}
            <div>
              <label htmlFor="distro-de" className="block text-xs font-semibold text-foreground mb-1.5">
                Escritorio por Defecto *
              </label>
              <input
                id="distro-de"
                type="text"
                placeholder="Ej: GNOME, KDE Plasma, XFCE"
                className={`input-field ${errors.desktopEnvironment ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
                {...register('desktopEnvironment', { required: 'El entorno de escritorio es obligatorio' })}
              />
              {errors.desktopEnvironment && <p className="mt-1 text-xs text-danger">{errors.desktopEnvironment.message}</p>}
            </div>

            {/* Arquitectura */}
            <div>
              <label htmlFor="distro-arch" className="block text-xs font-semibold text-foreground mb-1.5">
                Arquitectura soportada *
              </label>
              <input
                id="distro-arch"
                type="text"
                placeholder="Ej: x86_64, ARM64, i386"
                className={`input-field ${errors.architecture ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
                {...register('architecture', { required: 'La arquitectura es obligatoria' })}
              />
              {errors.architecture && <p className="mt-1 text-xs text-danger">{errors.architecture.message}</p>}
            </div>
          </div>

          {/* URL Web */}
          <div>
            <label htmlFor="distro-url" className="block text-xs font-semibold text-foreground mb-1.5">
              Sitio Web Oficial <span className="text-muted-foreground font-normal">(Opcional)</span>
            </label>
            <input
              id="distro-url"
              type="url"
              placeholder="https://example.org"
              className="input-field"
              {...register('websiteUrl')}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="distro-desc" className="block text-xs font-semibold text-foreground mb-1.5">
              Descripción / Resumen *
            </label>
            <textarea
              id="distro-desc"
              rows={4}
              placeholder="Escribe una pequeña descripción de los objetivos de la distro, gestor de paquetes que usa, enfoque..."
              className={`input-field resize-none py-2 ${errors.description ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
              {...register('description', { 
                required: 'La descripción es obligatoria',
                minLength: { value: 20, message: 'Por favor, escribe al menos 20 caracteres' }
              })}
            />
            {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
          </div>

          {/* Botón de envío */}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5 mt-2">
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Guardando distribución…
              </>
            ) : (
              <>
                <PlusCircle size={15} /> Registrar Distribución
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
