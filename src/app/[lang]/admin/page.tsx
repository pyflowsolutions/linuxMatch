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

      // PASO 3 (Lectura): Mapeamos explícitamente incluyendo los nuevos campos para la ficha técnica
      const { data: distroData, error: distroError } = await supabase
        .from('distributions')
        .select(`
          id,
          name,
          tagline,
          logoInitials:logo_initials,
          logoColor:logo_color,
          minRam:min_ram,
          minStorage:min_storage,
          minCpuCores:min_cpu_cores,
          releaseModel:release_model,
          cpuArchitecture:cpu_architecture,
          useCases:use_cases,
          descriptionEs:description_es,
          descriptionEn:description_en,
          latestVersion:latest_version,
          releaseDate:release_date,
          basedOn:based_on,
          easeOfUse:ease_of_use,
          hardwareEfficiency:hardware_efficiency,
          stabilityScore:stability_score,
          compatibilityScore:compatibility_score,
          communityRating:community_rating
        `)
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
      alert(`Error de la base de datos: ${error.message}`);
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleSaveDistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistro?.name) return;

    const distroId = editingDistro.id || editingDistro.name.toLowerCase().trim().replace(/\s+/g, '-');
    
    // PASO 3 (Escritura): Mapeamos de camelCase (Frontend) a snake_case (Campos reales de la BD en Supabase)
    const finalDistroDB = {
      id: distroId,
      name: editingDistro.name,
      tagline: editingDistro.tagline || '',
      logo_initials: editingDistro.logoInitials || editingDistro.name.substring(0, 3).toUpperCase(),
      logo_color: editingDistro.logoColor || '#3b82f6',
      min_ram: editingDistro.minRam || 2,
      min_storage: editingDistro.minStorage || 20,
      min_cpu_cores: editingDistro.minCpuCores || 2,
      release_model: editingDistro.releaseModel || 'LTS',
      cpu_architecture: editingDistro.cpuArchitecture || 'AMD64 / x86-64',
      use_cases: Array.isArray(editingDistro.useCases) ? editingDistro.useCases : ['Beginner'],
      
      // Nuevos campos vinculados mapeados a la base de datos
      description_es: editingDistro.descriptionEs || '',
      description_en: editingDistro.descriptionEn || '',
      latest_version: editingDistro.latestVersion || '1.0.0',
      release_date: editingDistro.releaseDate || '',
      based_on: editingDistro.basedOn || 'Independent',
      ease_of_use: editingDistro.easeOfUse ?? 80,
      hardware_efficiency: editingDistro.hardwareEfficiency ?? 80,
      stability_score: editingDistro.stabilityScore ?? 80,
      compatibility_score: editingDistro.compatibilityScore ?? 90,
      community_rating: editingDistro.communityRating ?? 4.5
    };

    try {
      const { error } = await supabase
        .from('distributions')
        .upsert(finalDistroDB)
        .select();

      if (error) {
        console.error("Error devuelto por Supabase:", error);
        alert(`🚨 ERROR AL GUARDAR EN SUPABASE:\n\nCódigo: ${error.code}\nMensaje: ${error.message}\nDetalles: ${error.details || 'Ninguno'}`);
      } else {
        alert(lang === 'es' ? '¡Distribución guardada correctamente!' : 'Distribution saved successfully!');
        fetchCollections();
        setEditingDistro(null);
      }
    } catch (err: any) {
      console.error("Error crítico en la ejecución del script:", err);
      alert(`❌ ERROR CRÍTICO DEL CLIENTE: ${err.message || err}`);
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
                      onClick={() => setEditingDistro({
                        name: '', tagline: '', logoInitials: '', logoColor: '#3b82f6',
                        minRam: 2, minStorage: 20, minCpuCores: 2, releaseModel: 'LTS',
                        cpuArchitecture: 'AMD64 / x86-64', useCases: ['Beginner'],
                        descriptionEs: '', descriptionEn: '', latestVersion: '1.0.0',
                        releaseDate: '', basedOn: 'Independent', easeOfUse: 80,
                        hardwareEfficiency: 80, stabilityScore: 80, compatibilityScore: 90,
                        communityRating: 4.5
                      })}
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

        {/* PANEL DERECHO: FORMULARIO PASO 2 COMPLETO */}
        <div className="lg:col-span-1">
          {activeTab === 'distros' && editingDistro ? (
            <div className="max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
              <form onSubmit={handleSaveDistro} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-2">
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
                
                {/* ─── BLOQUE 1: IDENTIDAD BÁSICA ─── */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Nombre de la Distribución</label>
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
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Iniciales Logo</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="UBUNTU -> UBU"
                        value={editingDistro.logoInitials || ''}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, logoInitials: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Color de Fondo Hex</label>
                      <input
                        type="color"
                        value={editingDistro.logoColor || '#3b82f6'}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, logoColor: e.target.value }))}
                        className="w-full h-8 rounded-xl border border-border bg-background cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Eslogan Breve (Tagline)</label>
                    <input
                      type="text"
                      value={editingDistro.tagline || ''}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* ─── BLOQUE 2: METADATOS TÉCNICOS Y HISTORIAL ─── */}
                <div className="bg-muted/30 p-3 rounded-xl border border-border/40 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Última Versión</label>
                      <input
                        type="text"
                        placeholder="e.g. 24.04 LTS"
                        value={editingDistro.latestVersion || ''}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, latestVersion: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Lanzamiento</label>
                      <input
                        type="text"
                        placeholder="e.g. April 2026"
                        value={editingDistro.releaseDate || ''}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Distribución Base (Based on)</label>
                    <input
                      type="text"
                      placeholder="Debian, Arch, Independent..."
                      value={editingDistro.basedOn || ''}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, basedOn: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* ─── BLOQUE 3: DESCRIPCIONES AMPLIADAS ─── */}
                <div className="bg-muted/20 p-3 rounded-xl border border-border/50 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Descripción Completa (ES)</label>
                    <textarea
                      rows={3}
                      value={editingDistro.descriptionEs || ''}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, descriptionEs: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Descripción Completa (EN)</label>
                    <textarea
                      rows={3}
                      value={editingDistro.descriptionEn || ''}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground resize-none"
                    />
                  </div>
                </div>

                {/* ─── BLOQUE 4: REQUISITOS DE HARDWARE ─── */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">RAM Mín. (GB)</label>
                    <input
                      type="number"
                      value={editingDistro.minRam || 2}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, minRam: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Disco Mín. (GB)</label>
                    <input
                      type="number"
                      value={editingDistro.minStorage || 20}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, minStorage: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Núcleos CPU</label>
                    <input
                      type="number"
                      value={editingDistro.minCpuCores || 2}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, minCpuCores: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                    />
                  </div>
                </div>

                {/* ─── BLOQUE 5: ARQUITECTURA Y CICLO ─── */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Ciclo de Lanzamiento</label>
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
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Arquitectura CPU</label>
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
                </div>

                {/* ─── BLOQUE 6: MÉTRICAS DE RENDIMIENTO (0 - 100) ─── */}
                <div className="bg-muted/30 p-3 rounded-xl border border-border/40 space-y-2">
                  <h4 className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider mb-1">Métricas de Gráfico de Radar</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Facilidad (Ease of use)</label>
                      <input
                        type="number" min={0} max={100}
                        value={editingDistro.easeOfUse ?? 80}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, easeOfUse: parseInt(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Eficiencia Hardware</label>
                      <input
                        type="number" min={0} max={100}
                        value={editingDistro.hardwareEfficiency ?? 80}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, hardwareEfficiency: parseInt(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Estabilidad (Stability)</label>
                      <input
                        type="number" min={0} max={100}
                        value={editingDistro.stabilityScore ?? 80}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, stabilityScore: parseInt(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Compatibilidad global</label>
                      <input
                        type="number" min={0} max={100}
                        value={editingDistro.compatibilityScore ?? 90}
                        onChange={(e) => setEditingDistro(prev => ({ ...prev, compatibilityScore: parseInt(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase block">Puntuación Comunidad (0.0 - 5.0)</label>
                    <input
                      type="number" step="0.1" min={0} max={5}
                      value={editingDistro.communityRating ?? 4.5}
                      onChange={(e) => setEditingDistro(prev => ({ ...prev, communityRating: parseFloat(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:opacity-90 transition-opacity"
                  >
                    Guardar Ficha
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
            </div>
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
