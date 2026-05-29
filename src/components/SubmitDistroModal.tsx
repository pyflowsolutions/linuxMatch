'use client';

import React, { useState } from 'react';
import { Mail, Plus, X, Send, CheckCircle } from 'lucide-react';

interface SubmitDistroModalProps {
  lang?: string;
}

export default function SubmitDistroModal({ lang = 'es' }: SubmitDistroModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [distroName, setDistroName] = useState('');
  const [tagline, setTagline] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 💡 RECOMENDACIÓN: Puedes usar Formspree (creando una cuenta gratuita en formspree.io)
      // Reemplaza 'tu_endpoint_formspree' por el ID que te den.
      // Si prefieres usar una API interna de Next.js, cambia la URL a '/api/send-email'
      const response = await fetch('https://formspree.io/f/tu_endpoint_formspree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nueva solicitud de alta: ${distroName}`,
          remitente: email,
          nombre_distro: distroName,
          eslogan: tagline,
          comentarios adicionales: comments,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Limpiar campos
        setEmail('');
        setDistroName('');
        setTagline('');
        setComments('');
      } else {
        alert('Hubo un problema al enviar la solicitud. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Error de red. Comprueba tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botón disparador superior derecho */}
      <button
        onClick={() => { setIsOpen(true); setIsSuccess(false); }}
        className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus size={14} />
        {lang === 'es' ? 'Añadir Distro' : 'Add Distro'}
      </button>

      {/* Backdrop y Ventana Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2 text-foreground font-black text-sm">
                <Mail size={16} className="text-primary" />
                {lang === 'es' ? 'Proponer Nueva Distribución' : 'Suggest New Distribution'}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido / Cuerpo */}
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
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-colors"
                  >
                    {lang === 'es' ? 'Cerrar ventana' : 'Close window'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === 'es' 
                      ? '¿No tienes cuenta de colaborador? Envíanos los datos esenciales de la distro y la daremos de alta manualmente tras la validación.' 
                      : 'Don\'t have a contributor account? Send us the essential distro data and we will register it manually after validation.'}
                  </p>

                  {/* Campo Correo */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Tu Correo de Contacto' : 'Your Contact Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Nombre Distro */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Nombre de la Distribución' : 'Distribution Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={distroName}
                      onChange={(e) => setDistroName(e.target.value)}
                      placeholder="p.e. Pop!_OS, Debian"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Eslogan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Eslogan Breve (Tagline)' : 'Short Tagline'}
                    </label>
                    <input
                      type="text"
                      required
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Excelente soporte para gráficas híbridas..."
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  {/* Campo Detalles / Comentarios */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {lang === 'es' ? 'Especificaciones o Comentarios adicionales' : 'Specifications or Additional comments'}
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Base (Ubuntu/Arch), requisitos mínimos estimados, URLs oficiales..."
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none transition-all"
                    />
                  </div>

                  {/* Botonera de acciones */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/45">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
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
                      {lang === 'es' ? 'Enviar Petición' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
