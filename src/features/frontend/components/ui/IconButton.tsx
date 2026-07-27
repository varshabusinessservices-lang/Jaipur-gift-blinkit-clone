import React from 'react';
import { clsx } from 'clsx';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: IconButtonProps) => {
  const sizes = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-3 rounded-2xl'
  };

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={clsx('inline-flex items-center justify-center transition-colors cursor-pointer', sizes[size], variants[variant], className)}
      {...props}
    >
      {icon}
    </button>
  );
};
