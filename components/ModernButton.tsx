import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  as?: 'button' | 'link';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-glow-lg',
  secondary: 'bg-gradient-to-r from-secondary to-secondary-dark text-white hover:shadow-lg',
  outline: 'border-2 border-primary text-primary bg-white hover:bg-primary/5',
  ghost: 'text-primary hover:bg-primary/10',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const ModernButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  fullWidth = false,
  style,
  as = 'button'
}: ModernButtonProps) => {
  const commonClasses = `
    inline-flex items-center justify-center gap-2
    rounded-xl font-bold
    transition-all duration-300
    transform hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  if (as === 'link') {
    return (
      <div className={commonClasses} style={style} onClick={onClick}>
        {icon && <span>{icon}</span>}
        {children}
      </div>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={commonClasses}
    >
      {loading ? (
        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
