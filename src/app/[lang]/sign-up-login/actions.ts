'use server';

import { createClient } from '@/lib/supabase/server';

export async function registrarNuevoUsuario(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Registrar el usuario en la autenticación nativa de Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}
