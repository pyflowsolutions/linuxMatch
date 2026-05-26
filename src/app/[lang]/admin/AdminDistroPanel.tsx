'use client';
import React, { useState } from 'react';
import { useAdminDistros } from '@/hooks/useAdminDistros';
import { Plus, Edit3, Trash2, Save, X, Settings2, HardDrive, Cpu, MemoryStick } from 'lucide-react';

export default function AdminDistroPanel({ lang }: { lang: string }) {
  const { distros, loading, saveDistro, deleteDistro } = useAdminDistros();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const t = lang === 'es' ? {
    add: 'Añadir Distribución',
    edit: 'Editar Ficha',
    save: 'Guardar Cambios',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    name: 'Nombre de la Distro',
    tagline: 'Eslogan corto',
    req: 'Requerimientos Mínimos'
  } : {
    add: 'Add Distribution',
    edit: 'Edit Sheet',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    name: 'Distro Name',
    tagline: 'Short tagline',
    req: 'Minimum Requirements'
  };

  const startEdit = (distro?: any) => {
    setFormData(distro || { name: '', tagline: '', logoColor: '#3b82f6', logoInitials: '', minRam: 2, minStorage: 20, minCpuCores: 2, useCases: ['general'] });
    setEditingId(distro ? distro.id : 'new');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-foreground">{lang === 'es' ? 'Gestión de Catálogo' : 'Catalog Management'}</h1>
          <p className="text-xs text-muted-foreground">{distros.length} {lang === 'es' ? 'distribuciones registradas' : 'registered distributions'}</p>
        </div>
        {!editingId && (
          <button onClick={() => startEdit()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all">
            <Plus size={18} /> {t.add}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTADO DE DISTROS */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="animate-pulse space-y-3"><div className="h-20 bg-muted rounded-xl"></div></div> : (
            distros.map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: d.logoColor }}>
                    {d.logoInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{d.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">ID: {d.id}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(d)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary"><Edit3 size={18} /></button>
                  <button onClick={() => deleteDistro(d.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FORMULARIO DE EDICIÓN (Sidebar) */}
        <div className="lg:col-span-1">
          {editingId ? (
            <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-lg sticky top-24 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm uppercase tracking-wider">{editingId === 'new' ? t.add : t.edit}</h2>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">{t.name}</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Initials</label>
                    <input type="text" maxLength={3} value={formData.logoInitials} onChange={e => setFormData({...formData, logoInitials: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Color</label>
                    <input type="color" value={formData.logoColor} onChange={e => setFormData({...formData, logoColor: e.target.value})} className="w-full h-9 rounded-xl cursor-pointer" />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2"><Settings2 size={12}/> {t.req}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <MemoryStick size={14} className="text-primary"/>
                      <input type="number" value={formData.minRam} onChange={e => setFormData({...formData, minRam: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <HardDrive size={14} className="text-primary"/>
                      <input type="number" value={formData.minStorage} onChange={e => setFormData({...formData, minStorage: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Cpu size={14} className="text-primary"/>
                      <input type="number" value={formData.minCpuCores} onChange={e => setFormData({...formData, minCpuCores: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => saveDistro(formData).then(() => setEditingId(null))}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <Save size={18} /> {t.save}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
              <Settings2 size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs">{lang === 'es' ? 'Selecciona una distro para editar' : 'Select a distro to edit'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
