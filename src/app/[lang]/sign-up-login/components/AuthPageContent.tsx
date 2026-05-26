'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Terminal,
  Search,
  Star,
  PlusCircle,
  Shield,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AtSign,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─────────────────────────────────────────────────── */
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

/* ─── Copy Button ───────────────────────────────────────────── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

/* ─── Login Form ────────────────────────────────────────────── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: error.message });
    } else {
      toast.success('Welcome back! Redirecting...', { icon: '🐧' });
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    }
    setIsSubmitting(false);
  };

  const fillDemo = () => {
    setValue('email', 'demo@linuxmatch.dev');
    setValue('password', 'Tux$2026!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {errors.root && (
        <div className="flex items-start gap-2.5 p-3 bg-danger-light border border-danger/20 rounded-lg">
          <Shield size={14} className="text-danger mt-0.5 shrink-0" />
          <p className="text-xs text-danger">{errors.root.message}</p>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold text-foreground mb-1.5">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`input-field ${errors.email ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="text-xs font-semibold text-foreground">
            Password
          </label>
          <button type="button" className="text-xs text-primary hover:underline" tabIndex={-1}>
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`input-field pr-10 ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" className="sr-only" {...register('rememberMe')} />
          <div className="w-4 h-4 rounded border-2 border-border group-hover:border-primary/50 transition-colors" />
        </div>
        <span className="text-xs text-muted-foreground">Remember me for 30 days</span>
      </label>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary font-semibold hover:underline">
          Create one free
        </button>
      </p>

      <div className="mt-4 p-4 bg-muted/60 rounded-xl border border-border">
        <p className="text-xs font-semibold text-foreground mb-2.5">Demo account — click to autofill</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-2xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-xs font-mono font-semibold text-foreground">demo@linuxmatch.dev</p>
            </div>
            <CopyButton value="demo@linuxmatch.dev" />
          </div>
          <div className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-2xs text-muted-foreground mb-0.5">Password</p>
              <p className="text-xs font-mono font-semibold text-foreground">Tux$2026!</p>
            </div>
            <CopyButton value="Tux$2026!" />
          </div>
        </div>
        <button type="button" onClick={fillDemo} className="mt-2.5 w-full text-xs font-semibold text-primary hover:underline text-center block">
          Autofill credentials
        </button>
      </div>
    </form>
  );
}

/* ─── Signup Form ───────────────────────────────────────────── */
function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>();

  const passwordValue = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username.toLowerCase().trim(),
          display_name: data.fullName,
        },
      },
    });

    if (error) {
      setError('root', { message: error.message });
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success('Account created! Check your email 🐧');
    }
    
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Account created!</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Please check your email to confirm your account. After confirmation, your profile will be active.
        </p>
        <Link href="/" className="btn-primary">
          Go to Distro Finder
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {errors.root && (
        <div className="flex items-start gap-2.5 p-3 bg-danger-light border border-danger/20 rounded-lg">
          <Shield size={14} className="text-danger mt-0.5 shrink-0" />
          <p className="text-xs text-danger">{errors.root.message}</p>
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="signup-username" className="block text-xs font-semibold text-foreground mb-1.5">
          Username
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <AtSign size={14} />
          </div>
          <input
            id="signup-username"
            type="text"
            placeholder="linus_tux"
            className={`input-field pl-9 ${errors.username ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Only letters, numbers and underscores allowed',
              },
            })}
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="signup-name" className="block text-xs font-semibold text-foreground mb-1.5">
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          placeholder="Linus Torvalds"
          className={`input-field ${errors.fullName ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
          {...register('fullName', { required: 'Full name is required' })}
        />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-xs font-semibold text-foreground mb-1.5">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          className={`input-field ${errors.email ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-xs font-semibold text-foreground mb-1.5">
          Password <span className="ml-1 text-muted-foreground font-normal">(min. 8 chars)</span>
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`input-field pr-10 ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="signup-confirm" className="block text-xs font-semibold text-foreground mb-1.5">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="signup-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            className={`input-field pr-10 ${errors.confirmPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === passwordValue || 'Passwords do not match',
            })}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>}
      </div>

      {/* Terms Checkbox */}
      <div>
        <label htmlFor="signup-agree-terms" className="flex items-start gap-2.5 cursor-pointer group select-none">
          <input 
            id="signup-agree-terms"
            type="checkbox" 
            className="h-4 w-4 rounded border-2 border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary mt-0.5" 
            {...register('agreeTerms', { required: 'You must agree to the terms' })} 
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree to the <a href="#" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and <a href="#" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
          </span>
        </label>
        {errors.agreeTerms && <p className="mt-1 text-xs text-danger">{errors.agreeTerms.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Creating account…
          </>
        ) : (
          'Create Free Account'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ─── Main Auth Page ────────────────────────────────────────── */
export default function AuthPageContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const features = [
    { icon: PlusCircle, title: 'Submit distributions', desc: 'Suggest new or updated distros for community review' },
    { icon: Star, title: 'Write reviews', desc: 'Share your real-world experience with each distro' },
    { icon: Search, title: 'Save your searches', desc: 'Bookmark distros and track your hardware profiles' },
    { icon: Shield, title: 'Community moderation', desc: 'Help verify and improve distro accuracy as a trusted member' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-extrabold text-base text-foreground">
              Linux<span className="text-primary">Match</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={13} />
            Back to Distro Finder
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card rounded-2xl border border-border card-shadow-lg overflow-hidden">
          {/* Left panel */}
          <div className="gradient-hero p-8 lg:p-10 flex flex-col justify-between hidden lg:flex">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Terminal size={16} className="text-white" />
                </div>
                <span className="text-white font-extrabold text-lg">Linux<span className="text-accent">Match</span></span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-3 text-balance">
                {mode === 'login' ? 'Welcome back to the Linux community' : 'Join the Linux compatibility database'}
              </h2>
              <div className="space-y-4 mt-8">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={`feature-${title}`} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-xs text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-7">
              <button onClick={() => setMode('login')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${mode === 'login' ? 'bg-card text-foreground card-shadow' : 'text-muted-foreground'}`}>
                Sign In
              </button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${mode === 'signup' ? 'bg-card text-foreground card-shadow' : 'text-muted-foreground'}`}>
                Create Account
              </button>
            </div>

            <div className="animate-fade-in">
              {mode === 'login' ? <LoginForm onSwitch={() => setMode('signup')} /> : <SignupForm onSwitch={() => setMode('login')} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
