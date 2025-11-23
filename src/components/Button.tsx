import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    group inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl
    transition-all duration-200 relative overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
      text-white shadow-lg shadow-indigo-500/50
      hover:shadow-xl hover:shadow-indigo-500/60
      hover:scale-[1.02] hover:-translate-y-0.5
      active:scale-[0.98] active:translate-y-0
      focus:ring-indigo-500
    `,
    secondary: `
      bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600
      text-white shadow-lg shadow-emerald-500/50
      hover:shadow-xl hover:shadow-emerald-500/60
      hover:scale-[1.02] hover:-translate-y-0.5
      active:scale-[0.98] active:translate-y-0
      focus:ring-emerald-500
    `,
    danger: `
      bg-gradient-to-br from-rose-600 via-red-600 to-pink-600
      text-white shadow-lg shadow-rose-500/50
      hover:shadow-xl hover:shadow-rose-500/60
      hover:scale-[1.02] hover:-translate-y-0.5
      active:scale-[0.98] active:translate-y-0
      focus:ring-rose-500
    `,
    ghost: `
      bg-white/80 backdrop-blur-sm
      text-slate-700 border border-slate-200
      hover:bg-white hover:border-slate-300
      hover:shadow-md
      focus:ring-slate-400
    `,
    glass: `
      bg-white/10 backdrop-blur-md
      text-white border border-white/20
      hover:bg-white/20 hover:border-white/30
      shadow-lg shadow-black/10
      focus:ring-white/50
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="relative z-10 transition-transform group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {variant !== 'ghost' && variant !== 'glass' && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                     -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </button>
  );
}
