'use client';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { Distro } from '@/components/distroData';

export function useAdminDistros() {
  const supabase = createClient();
  const [distros, setDistros] = useState<Distro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistros = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('distributions')
      .select('*')
      .order('name', { ascending: true });
    
    if (!error) setDistros(data as any);
    setLoading(false);
  };

  const saveDistro = async (distro: Partial<Distro>) => {
    const isNew = !distros.find(d => d.id === distro.id);
    
    // Generar ID/Slug automático si es nueva
    const finalDistro = {
      ...distro,
      id: distro.id || distro.name?.toLowerCase().replace(/\s+/g, '-')
    };

    const { error } = await supabase
      .from('distributions')
      .upsert(finalDistro);

    if (!error) fetchDistros();
    return { error };
  };

  const deleteDistro = async (id: string) => {
    const { error } = await supabase
      .from('distributions')
      .delete()
      .eq('id', id);

    if (!error) fetchDistros();
    return { error };
  };

  useEffect(() => { fetchDistros(); }, []);

  return { distros, loading, saveDistro, deleteDistro, refresh: fetchDistros };
}
