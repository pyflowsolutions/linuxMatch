export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;        // UUID mapeado de auth.users
  name: string;
  email: string;
  role: UserRole;    -- 'admin' o 'user'
  updated_at?: string;
}

// Interfaz extendida para el estado global de tu sesión de usuario en la App
export interface CurrentSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
