import React from 'react';

interface ModernModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const ModernModal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = 'md',
}: ModernModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ${sizeStyles[size]} w-full mx-4 animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-outline">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-light hover:text-on-surface transition-colors p-2 hover:bg-surface-container rounded-lg"
          >
            <span className="material-symbols-outlined notranslate" translate="no">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-4 p-8 border-t border-outline bg-surface-container-low rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
