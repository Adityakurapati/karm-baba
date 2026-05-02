import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  onClick,
  style
}: ModernCardProps) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        relative bg-white rounded-2xl border border-outline shadow-soft
        transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white via-white to-primary-ultra-light' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
