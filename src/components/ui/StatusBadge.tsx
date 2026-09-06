import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StatusBadgeProps {
  label: string;
  variant?: 'ink' | 'stone' | 'terracotta' | 'olive' | 'amber' | 'neutral';
  prefix?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'stone',
  prefix,
  size = 'sm',
  className
}) => {
  const variantStyles = {
    ink: 'bg-ink-900 text-paper-100 border-ink-900',
    stone: 'bg-paper-200 text-stone-600 border-paper-400',
    terracotta: 'bg-orange-50 text-editorial-terracotta border-orange-200/80',
    olive: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    neutral: 'bg-paper-100 text-ink-700 border-paper-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-wider gap-1.5 font-mono',
    md: 'text-xs px-3 py-1 tracking-wider gap-2 font-mono',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center uppercase font-medium rounded-full border select-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
    >
      {prefix && <span className="opacity-60 font-normal">{prefix}</span>}
      <span>{label}</span>
    </span>
  );
};

