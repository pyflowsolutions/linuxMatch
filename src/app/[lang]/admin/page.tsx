'use client';

import React, { useState } from 'react';
import { Users, Disc, ShieldAlert, Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { ALL_DISTROS, Distro } from '@/components/distroData';

// Interfaces de simulación
interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AdminPanelProps {
  lang: string;
  currentUser: { role: string; name: string } | null; // Usuario actualmente logueado
}

export default function AdminDashboard({ lang, currentUser }: AdminPanelProps) {
  // 1. Cláusula de protección: Si no es administrador, denegar el acceso inmediatamente
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-card border border-destructive/30 rounded-2xl shadow-sm">
        <ShieldAlert size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">
          {lang === 'es' ? 'Acceso Denegado' : 'Access Denied'}
        </h2>
        <p className="text-xs text-muted-foreground">
          {lang === 'es' 
            ? 'No tienes los permisos necesarios para ver esta sección.' 
            : 'You do not have the required permissions to view this section.'}
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'users' | 'distros'>('users');

  // Estados locales simulando persistencia de datos
  const [users, setUsers] = useState<ManagedUser[]>([
    { id: '1', name: 'Luis Sergio', email: 'luis@example.com', role: 'admin' },
    { id: '2', name: 'Carlos Mendoza', email: 'carlos@example.com', role: 'user' },
    { id: '3', name: 'Ana Gómez', email: 'ana@example.com', role: 'user' },
  ]);
  const [distros, setDistros] = useState<Distro[]>(ALL_DISTROS || []);

  // --- LÓGICA DE USUARIOS ---
  const toggleUserRole = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    if (confirm(lang === 'es' ? '¿Seguro que deseas eliminar este usuario?' : 'Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // --- LÓGICA DE DISTRIBUCIONES ---
  const [editingDistro, setEditingDistro] = useState<Partial<Distro> | null>(null);

  const handleSaveDistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistro?.name) return;

    if (editingDistro.id) {
      // Editar existente
      setDistros(prev => prev.map(d => String(d.id) === String(editingDistro.id) ? (editingDistro as Distro) : d));
    } else {
      // Crear nueva ficha
      const newDistro: Distro = {
        ...(editingDistro as Distro),
        id: editingDistro.name.toLowerCase().replace(/\s+/g, '-'),
        reviewCount: 0,
        communityRating: 5.0,
        compatibilityScore: 100,
        useCases: editingDistro.useCases || ['general'],
      };
      setDistros(prev => [newDistro, ...prev]);
    }
    setEditingDistro(null); // Cerrar formulario
  };

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
        
        {/* PANEL IZQUIERDO / TABLA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB 1: GESTIÓN DE USUARIOS */}
          {activeTab === 'users' && (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === 'es' ? 'Usuarios del Sistema' : 'System Users'}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{u.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleUserRole(u.id)}
                        title={lang === 'es' ? 'Cambiar Rol de Permisos' : 'Toggle Permission Role'}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-colors"
                      >
                        <UserCheck size={16} />
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        title={lang === 'es' ? 'Eliminar Usuario' : 'Delete User'}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GESTIÓN DE DISTRIBUCIONES */}
          {activeTab === 'distros' && (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === 'es' ? 'Fichas Tecnológicas' : 'Technological Sheets'}
                </h3>
                <button
                  onClick={() => setEditingDistro({ name: '', tagline: '', logoInitials: '', logoColor: '#3b82f6', minRam: 2, minStorage: 20, minCpuCores: 2, releaseModel: 'LTS', useCases: ['general'] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                  {lang === 'es' ? 'Nueva Ficha' : 'New Sheet'}
                </button>
              </div>
              <div className="divide-y divide-border">
                {distros.map((d) => (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: FORMULARIO DINÁMICO DE CREACIÓN/EDICIÓN */}
        <div className="lg:col-span-1">
          {activeTab === 'distros' && editingDistro ? (
            <form onSubmit={handleSaveDistro} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {editingDistro.id ? (lang === 'es' ? 'Editar Distribución' : 'Edit Distribution') : (lang === 'es' ? 'Nueva Distribución' : 'Create Distribution')}
              </h3>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">{lang === 'es' ? 'Nombre' : 'Name'}</label>
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

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:opacity-90 transition-opacity"
                >
                  {lang === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDistro(null)}
                  className="px-4 py-2 border border-border bg-muted/40 text-muted-foreground font-semibold text-xs rounded-xl hover:bg-muted transition-colors"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-6 text-center text-xs text-muted-foreground">
              {lang === 'es' 
                ? 'Selecciona una distribución de la lista para editarla o crea una nueva ficha utilizando el botón superior.' 
                : 'Select a distribution from the list to edit or create a new sheet using the top button.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
