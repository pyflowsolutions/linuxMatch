'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, User, AtSign, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileFormData {
  username: string;
  fullName: string;
}

export default function EditProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>();

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

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.updateUser({
      data: {
        username: data.username.toLowerCase().trim(),
        display_name: data.fullName,
      },
    });

    if (error) {
      toast.error(`Error updating profile: ${error.message}`);
    } else {
      toast.success('Profile updated successfully! 🐧');
      setTimeout(() => window.location.reload(), 500);
    }
    setIsSubmitting(false);
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
        <p className="text-sm text-muted-foreground">Please sign in to edit your profile.</p>
        <Link href="/sign-up-login" className="btn-primary mt-4">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 my-10 bg-card rounded-2xl border border-border card-shadow">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-extrabold text-foreground mb-1">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Update your public profile identifier and personal details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
              className={`input-field pl-9 ${errors.username ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Must be at least 3 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Only letters, numbers and underscores allowed',
                },
              })}
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-name" className="block text-xs font-semibold text-foreground mb-1.5">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            className={`input-field ${errors.fullName ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
            {...register('fullName', { required: 'Full name is required' })}
          />
          {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5 mt-2">
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Saving changes…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}
