'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, User, AtSign, ShieldAlert, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface ProfileFormData {
  username: string;
  fullName: string;
}

interface PasswordFormData {
  currentPassword?: string; // Supabase no requiere la actual para cambiarla, pero puedes pedirla si quieres
  newPassword: string;
  confirmNewPassword: string;
}

export default function EditProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Formulario de Perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue,
    setError: setErrorProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>();

  // Formulario de Contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPasswordValue = watch('newPassword', '');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setValue('username', session.user.user_metadata?.username || '');
        setValue('fullName', session.user.user_metadata?.display_name || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, [setValue]);

  // Guardar datos del Perfil (Username / Nombre)
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmittingProfile(true);
    
    const { error } = await supabase.auth.updateUser({
      data: {
        username: data.username.toLowerCase().trim(),
        display_name: data.fullName,
      },
    });

    if (error) {
      // Si el error es por duplicado en la base de datos (Trigger/Constraint)
      if (error.message.toLowerCase().includes('unique') || error.message.toLowerCase().includes('already exists')) {
        setErrorProfile('username', { message: 'This username is already taken' });
        toast.error('Username already in use');
      } else {
        toast.error(`Error updating profile: ${error.message}`);
      }
    } else {
      toast.success('Profile updated successfully! 🐧');
      setTimeout(() => window.location.reload(), 500);
    }
    setIsSubmittingProfile(false);
  };

  // Guardar Nueva Contraseña
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmittingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (error) {
      toast.error(`Error updating password: ${error.message}`);
    } else {
      toast.success('Password changed successfully! 🔑');
      resetPasswordForm(); // Limpia las cajas de texto de contraseña
    }
    setIsSubmittingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="text-danger mb-2" size={40} />
        <h2 className="text-lg font-bold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">Please sign in to manage your account.</p>
        <Link href="/sign-up-login" className="btn-primary mt-4">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 my-6 sm:my-10 space-y-8">
      
      {/* Botón Volver */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
      </div>

      {/* BLOQUE 1: Datos de Perfil */}
      <div className="bg-card rounded-2xl border border-border card-shadow p-6">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-foreground mb-1">Account Settings</h1>
          <p className="text-sm text-muted-foreground">Update your public profile identifier and personal details.</p>
        </div>

        <form onSubmit={handleSubmitProfile(onProfileSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="profile-username" className="block text-xs font-semibold text-foreground mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <AtSign size={14} />
              </div>
              <input
                id="profile-username"
                type="text"
                className={`input-field pl-9 ${profileErrors.username ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
                {...registerProfile('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Only letters, numbers and underscores allowed',
                  },
                })}
              />
            </div>
            {profileErrors.username && <p className="mt-1 text-xs text-danger">{profileErrors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-foreground mb-1.5">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              className={`input-field ${profileErrors.fullName ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
              {...registerProfile('fullName', { required: 'Full name is required' })}
            />
            {profileErrors.fullName && <p className="mt-1 text-xs text-danger">{profileErrors.fullName.message}</p>}
          </div>

          <button type="submit" disabled={isSubmittingProfile} className="btn-primary w-full justify-center py-2.5 mt-2">
            {isSubmittingProfile ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving changes…
              </>
            ) : (
              'Save Profile Info'
            )}
          </button>
        </form>
      </div>

      {/* BLOQUE 2: Cambiar Contraseña */}
      <div className="bg-card rounded-2xl border border-border card-shadow p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground">Change your password to secure your developer account.</p>
        </div>

        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} noValidate className="space-y-4">
          
          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="profile-new-password" className="block text-xs font-semibold text-foreground mb-1.5">
              New Password <span className="text-muted-foreground font-normal">(min. 8 chars)</span>
            </label>
            <div className="relative">
              <input
                id="profile-new-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pr-10 ${passwordErrors.newPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordErrors.newPassword && <p className="mt-1 text-xs text-danger">{passwordErrors.newPassword.message}</p>}
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label htmlFor="profile-confirm-password" className="block text-xs font-semibold text-foreground mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="profile-confirm-password"
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pr-10 ${passwordErrors.confirmNewPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
                {...registerPassword('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPasswordValue || 'Passwords do not match',
                })}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPass(!showConfirmPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordErrors.confirmNewPassword && <p className="mt-1 text-xs text-danger">{passwordErrors.confirmNewPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmittingPassword} className="btn-secondary w-full justify-center py-2.5 mt-2 bg-muted hover:bg-muted/80 text-foreground border border-border">
            {isSubmittingPassword ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Updating password…
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
