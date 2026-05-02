import React from 'react';

interface ModernStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan' | 'yellow';
}

const colorGradients: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-success to-green-600',
  orange: 'from-primary to-primary-dark',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
  cyan: 'from-cyan-500 to-cyan-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

const colorBg: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  yellow: 'bg-yellow-50 text-yellow-600',
};

export const ModernStatCard = ({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'orange',
}: ModernStatCardProps) => {
  return (
    <div
      className={`
        group bg-white p-8 rounded-2xl border border-outline shadow-soft
        hover:shadow-xl transition-all duration-300 transform hover:scale-105
        hover:-translate-y-1 cursor-pointer
      `}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-on-surface-light mb-2 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r" style={{backgroundImage: `linear-gradient(135deg, var(--primary), var(--secondary))`}}>
            {value}
          </p>
          {change && (
            <p className={`text-xs font-bold mt-2 ${
              changeType === 'up' ? 'text-success' : changeType === 'down' ? 'text-error' : 'text-on-surface-light'
            }`}>
              {changeType === 'up' && '↑ '}{changeType === 'down' && '↓ '}{change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorBg[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 rounded-full bg-gradient-to-r ${colorGradients[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};
