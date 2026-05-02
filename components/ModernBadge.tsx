import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/20 text-primary border border-primary/30',
  success: 'bg-success/20 text-success border border-success/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  error: 'bg-error/20 text-error border border-error/30',
  info: 'bg-info/20 text-info border border-info/30',
};

export const ModernBadge = ({
  children,
  variant = 'primary',
  className = '',
  icon,
}: ModernBadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-lg
        text-xs font-bold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};
