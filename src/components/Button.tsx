import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-sm)',
      },
      secondary: {
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        border: 'none',
      },
      danger: {
        backgroundColor: 'var(--color-error-600)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-sm)',
      },
      success: {
        backgroundColor: 'var(--color-success-600)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-sm)',
      },
    };

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.75rem',
        gap: '0.25rem',
      },
      md: {
        padding: '0.75rem 1.25rem',
        fontSize: '0.875rem',
        gap: '0.5rem',
      },
      lg: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        gap: '0.5rem',
      },
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      lineHeight: 1,
      textDecoration: 'none',
      borderRadius: '0.5rem',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      width: fullWidth ? '100%' : 'auto',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const displayIcon = icon || leftIcon;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={baseStyles}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span style={{ marginLeft: '0.5rem' }}>로딩 중...</span>
          </>
        ) : (
          <>
            {displayIcon && <span style={{ flexShrink: 0 }}>{displayIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span style={{ flexShrink: 0 }}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function LoadingSpinner() {
  return (
    <svg
      style={{
        width: '1rem',
        height: '1rem',
        animation: 'spin 1s linear infinite',
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Button;
