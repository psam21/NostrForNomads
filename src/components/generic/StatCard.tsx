import React from 'react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'primary' | 'green' | 'blue' | 'gray' | 'yellow' | 'orange' | 'red';
  description?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
    value: 'text-primary-900',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    value: 'text-green-900',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    value: 'text-blue-900',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    value: 'text-gray-900',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    value: 'text-yellow-900',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    value: 'text-orange-900',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    value: 'text-red-900',
  },
};

/**
 * Reusable stat card component for dashboard metrics
 * Provides consistent styling across all "My" pages
 */
export function StatCard({ label, value, icon, color = 'primary', description }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold ${colors.value} mt-1`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 ${colors.bg} rounded-full`}>
            <div className={colors.text}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
