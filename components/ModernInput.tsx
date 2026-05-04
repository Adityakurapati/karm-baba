import React from 'react';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
}

export const ModernInput = ({
  label,
  icon,
  error,
  fullWidth = false,
  className = '',
  ...props
}: ModernInputProps) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-bold text-on-surface mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-light group-hover:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`
            w-full bg-surface-container-low border border-outline-variant
            rounded-xl py-3 px-4 text-sm
            ${icon ? 'pl-12' : 'pl-4'}
            focus:ring-2 focus:ring-primary/40 focus:border-primary
            transition-all outline-none text-on-surface placeholder:text-on-surface-light
            shadow-soft hover:shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error/40 focus:border-error' : ''}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-error mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};
