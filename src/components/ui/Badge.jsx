import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-sand-100 text-stone-800 border-sand-200',
    clay: 'bg-clay-50 text-clay-700 border-clay-200',
    sage: 'bg-sage-50 text-sage-700 border-sage-200',
    dark: 'bg-stone-900 text-sand-50 border-stone-800',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}
