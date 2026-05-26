'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Disc, ShieldAlert, Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Distro } from '@/components/distroData';

interface ManagedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user';
}

export default function AdminDashboard({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const router = useRouter();
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'distros'>('users');
  const [loadingData, setLoadingData] = useState(true);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [distros, setDistros] = useState<Distro[]>([]);
  const [editingDistro, setEditingDistro] = useState<Partial<Distro> | null>(null);

  useEffect(() => {
    async function checkAdminSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push(`/${lang}/sign-up-login`);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
        fetchCollections();
      } else {
        setIsAdmin(false);
        router.push(`/${lang}`);
      }
    }
    checkAdminSession();
  }, [supabase, router, lang]);

  const fetchCollections = async () => {
    setLoadingData(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .order('name', { ascending: true });

      const { data: distroData, error: distroError } = await supabase
        .from('distributions')
        .select('*')
        .order('name', { ascending: true });

      if (userError) throw userError;
      if (distroError) throw distroError;

      if (userData) setUsers(userData as ManagedUser[]);
      if (distroData) setDistros(distroData as Distro[]);
    } catch (err: any) {
      console.error("Error cargando colecciones:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: nextRole })
      .eq('id', userId);

    if (error) {
      alert(`Error cambiando rol: ${error.message}`);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole as any } : u));
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmMsg = lang === 'es' ? '¿Seguro que deseas eliminar este usuario?' : 'Are you sure you want to delete this user?';
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      alert(`Error eliminando usuario: ${error.message}`);
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleSaveDistro = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingDistro?.name) return;

  // Generamos el ID único (slug) si es una distro nueva
  const distroId = editingDistro.id || editingDistro.name.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Mapeamos el objeto asegurando que las claves coincidan EXACTAMENTE 
  // con las columnas que pusimos en el script SQL de Supabase
  const finalDistro = {
    id: distroId,
    name: editingDistro.name,
    tagline: editingDistro.tagline || '',
    logoInitials: editingDistro.logoInitials || editingDistro.name.substring(0, 3).toUpperCase(),
    logoColor: editingDistro.logoColor || '#3b82f6',
    minRam: editingDistro.minRam || 2,
    minStorage: editingDistro.minStorage || 20,
    minCpuCores: editingDistro.minCpuCores || 2,
    releaseModel: editingDistro.releaseModel || 'LTS',
    cpuArchitecture: editingDistro.cpuArchitecture || 'AMD64 / x86-64',
    // Aseguramos que useCases sea un Array válido para la columna text[]
    useCases: Array.isArray(editingDistro.useCases) ? editingDistro.useCases : ['Beginner']
  };

  try {
    const { error } = await supabase
      .from('distributions')
      .upsert(finalDistro);

    if (error) {
      // Si Supabase rechaza el insert por falta de una columna o tipos erróneos, saltará aquí
      console.error("Error de Supabase:", error);
      alert(`Error al guardar en Supabase:\n\nMensaje: ${error.message}\nDetalle: ${error.details || 'Ninguno'}\nCódigo: ${error.code}`);
    } else {
      alert('¡Distribución guardada correctamente en la base de datos!');
      // Refrescamos la lista de la izquierda
      if (typeof fetchCollections === 'function') {
        fetchCollections();
      }
      // Cerramos el formulario limpiando el estado
      setEditingDistro(null);
    }
  } catch (err: any) {
    console.error("Error crítico en la petición:", err);
    alert(`Error inesperado en el cliente: ${err.message || err}`);
  }
};

  const handleDeleteDistro = async (id: string) => {
    const confirmMsg = lang === 'es' ? '¿Eliminar esta distribución del catálogo?' : 'Delete this distribution from the catalog?';
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('distributions')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
      setDistros(prev => prev.filter(d => d.id !== id));
      setEditingDistro(null);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-card border border-destructive/30 rounded-2xl shadow-sm">
        <ShieldAlert size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">
          {lang === 'es' ? 'Acceso Denegado' : 'Access Denied'}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-foreground space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            {lang === 'es' ? 'Panel de Control de Administración' : 'Admin Control Panel'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === 'es' ? 'Gestión global de identidades y catálogo técnico' : 'Global management of identities and technical catalog'}
          </p>
        </div>
        
        {/* Selector de pestañas */}
        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => { setActiveTab('users'); setEditingDistro(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'users' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users size={14} />
            {lang === 'es' ? 'Usuarios' : 'Users'}
          </button>
          <button
            onClick={() => setActiveTab('distros')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'distros' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Disc size={14} />
            {lang === 'es' ? 'Distribuciones' : 'Distributions'}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-2 space-y-4">
          {loadingData ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-12 bg-muted rounded-xl" />
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === 'es' ? 'Usuarios del Sistema' : 'System Users'}
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {users.length === 0 ? (
                      <p className="p-4 text-xs text-muted-foreground text-center">No hay perfiles sincronizados todavía.</p>
                    ) : (
                      users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{u.name || 'Sin nombre'}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                {u.role.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleUserRole(u.id, u.role)}
                              title="Cambiar Rol"
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-colors"
                            >
                              <UserCheck size={16} />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              title="Eliminar Usuario"
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'distros' && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === 'es' ? 'Fichas Tecnológicas' : 'Technological Sheets'}
                    </h3>
                    <button
                      onClick={() => setEditingDistro({ name: '', tagline: '', logoInitials: '', logoColor: '#3b82f6', minRam: 2, minStorage: 20, minCpuCores: 2, releaseModel: 'LTS', cpuArchitecture: 'AMD64 / x86-64', useCases: ['Beginner'] })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Plus size={14} />
                      {lang === 'es' ? 'Nueva Ficha' : 'New Sheet'}
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {distros.length === 0 ? (
                      <p className="p-4 text-xs text-muted-foreground text-center">El catálogo en Supabase está vacío.</p>
                    ) : (
                      distros.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0" style={{ backgroundColor: d.logoColor }}>
                              {d.logoInitials}
                            </div>
                            <div>
                              <span className="text-xs font-bold block">{d.name}</span>
                              <span className="text-[11px] text-muted-foreground line-clamp-1">{d.tagline}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingDistro(d)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* PANEL DERECHO: FORMULARIO */}
        <div className="lg:col-span-1">
          {activeTab === 'distros' && editingDistro ? (
            <form onSubmit={handleSaveDistro} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {editingDistro.id ? 'Editar Distribución' : 'Nueva Distribución'}
                </h3>
                {editingDistro.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDistro(editingDistro.id!)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingDistro.name || ''}
                  onChange={(e) => setEditingDistro(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Initials</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={editingDistro.logoInitials || ''}
                    onChange={(e) => setEditingDistro(prev => ({ ...prev, logoInitials: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Color Hex</label>
                  <input
                    type="color"
                    value={editingDistro.logoColor || '#3b82f6'}
                    onChange={(e) => setEditingDistro(prev => ({ ...prev, logoColor: e.target.value }))}
                    className="w-full h-8 rounded-xl border border-border bg-background cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tagline</label>
                <input
                  type="text"
                  value={editingDistro.tagline || ''}
                  onChange={(e) => setEditingDistro(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">RAM (GB)</label>
                  <input
                    type="number"
                    value={editingDistro.minRam || 2}
                    onChange={(e) => setEditingDistro(prev => ({ ...prev, minRam: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Disk (GB)</label>
                  <input
                    type="number"
                    value={editingDistro.minStorage || 20}
                    onChange={(e) => setEditingDistro(prev => ({ ...prev, minStorage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Cores</label>
                  <input
                    type="number"
                    value={editingDistro.minCpuCores || 2}
                    onChange={(e) => setEditingDistro(prev => ({ ...prev, minCpuCores: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              {/* Nuevos Selectores para cumplir las restricciones de filtrado */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Modelo de Lanzamiento</label>
                <select
                  value={editingDistro.releaseModel || 'LTS'}
                  onChange={(e) => setEditingDistro(prev => ({ ...prev, releaseModel: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="LTS">LTS</option>
                  <option value="Rolling">Rolling</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Semi-rolling">Semi-rolling</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Arquitectura CPU</label>
                <select
                  value={editingDistro.cpuArchitecture || 'AMD64 / x86-64'}
                  onChange={(e) => setEditingDistro(prev => ({ ...prev, cpuArchitecture: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="AMD64 / x86-64">AMD64 / x86-64</option>
                  <option value="ARM64">ARM64</option>
                  <option value="x86 (32-bit)">x86 (32-bit)</option>
                  <option value="RISC-V">RISC-V</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:opacity-90 transition-opacity"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDistro(null)}
                  className="px-4 py-2 border border-border bg-muted/40 text-muted-foreground font-semibold text-xs rounded-xl hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-6 text-center text-xs text-muted-foreground">
              Selecciona una distribución de la lista para editarla o crea una nueva ficha utilizando el botón superior.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
