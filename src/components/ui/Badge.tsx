import React from 'react';

type BadgeVariant =
  | 'default' |'primary' |'accent' |'success' |'warning' |'danger' |'info' |'outline' |'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-light text-primary',
  accent: 'bg-accent-light text-accent',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  outline: 'bg-transparent border border-border text-muted-foreground',
  muted: 'bg-muted/80 text-muted-foreground',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
  size = 'md',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}