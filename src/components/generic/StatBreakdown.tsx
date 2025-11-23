import React from 'react';

export interface StatBreakdownItem {
  label: string;
  value: number;
  color?: string;
}

export interface StatBreakdownProps {
  title: string;
  items: StatBreakdownItem[];
  maxVisible?: number;
  emptyMessage?: string;
}

/**
 * Reusable breakdown display component
 * Shows top N items with "X more" indicator
 * Used for "By Category", "By Type", etc. metrics
 */
export function StatBreakdown({ 
  title, 
  items, 
  maxVisible = 3,
  emptyMessage = 'No data available'
}: StatBreakdownProps) {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
        <p className="text-sm text-gray-400 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
      <div className="space-y-2">
        {visibleItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 truncate flex-1 mr-2">{item.label}</span>
            <span className="font-semibold text-primary-900 flex-shrink-0">{item.value}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-xs text-gray-500 pt-1">
            +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
    </div>
  );
}
