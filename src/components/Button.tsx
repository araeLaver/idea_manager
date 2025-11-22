import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
    inline-flex items-center justify-center gap-2.5 font-bold rounded-2xl
    transition-all duration-300 relative overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600
      text-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]
      hover:shadow-[0_30px_70px_rgba(8,_112,_184,_0.9)]
      hover:scale-110 hover:-translate-y-3
      active:scale-100 active:translate-y-0
      border-4 border-white/20
    `,
    secondary: `
      bg-gradient-to-r from-pink-500 via-red-500 to-orange-500
      text-white shadow-[0_20px_50px_rgba(236,_72,_153,_0.7)]
      hover:shadow-[0_30px_70px_rgba(236,_72,_153,_0.9)]
      hover:scale-110 hover:-translate-y-3
      active:scale-100 active:translate-y-0
      border-4 border-white/20
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-rose-700
      text-white shadow-[0_20px_50px_rgba(220,_38,_38,_0.7)]
      hover:shadow-[0_30px_70px_rgba(220,_38,_38,_0.9)]
      hover:scale-110 hover:-translate-y-3
      active:scale-100 active:translate-y-0
      border-4 border-white/20
    `,
    ghost: `
      bg-gradient-to-r from-slate-100 to-slate-200
      text-slate-700 border-2 border-slate-300
      hover:from-slate-200 hover:to-slate-300
      hover:scale-105 hover:-translate-y-1
      shadow-lg hover:shadow-xl
    `
  };

  const sizes = {
    sm: 'px-8 py-3 text-base font-black',
    md: 'px-12 py-5 text-xl font-black',
    lg: 'px-16 py-6 text-2xl font-black'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {variant !== 'ghost' && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                     -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </button>
  );
}
