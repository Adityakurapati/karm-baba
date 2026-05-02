import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ModernTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  onRowClick?: (row: any) => void;
}

export const ModernTable = ({
  columns,
  data,
  className = '',
  onRowClick,
}: ModernTableProps) => {
  return (
    <div className={`bg-white rounded-2xl border border-outline shadow-soft overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-container-high border-b border-outline">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-outline
                  transition-all duration-200
                  ${onRowClick ? 'hover:bg-primary-ultra-light cursor-pointer' : ''}
                  ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-container-low'}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-on-surface">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
