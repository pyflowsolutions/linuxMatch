'use server';

import { createClient } from '@/lib/supabase/server';

// 1. Registro básico
export async function registrarUsuario(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

// 2. Login básico
export async function iniciarSesion(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  // IMPORTANTE: Supabase te dirá en `data.session.user.factors` si el usuario tiene MFA activo.
  return { success: true, user: data.user, session: data.session };
}
