import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TechnicalGridProps {
  children?: React.ReactNode;
  pattern?: 'grid' | 'dots' | 'schematic';
  opacity?: number;
  className?: string;
}

export const TechnicalGrid: React.FC<TechnicalGridProps> = ({
  children,
  pattern = 'grid',
  opacity = 0.5,
  className,
}) => {
  return (
    <div className={twMerge(clsx('relative overflow-hidden', className))}>
      {/* Background layer */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 select-none',
          pattern === 'grid' && 'bg-tech-grid',
          pattern === 'dots' && 'bg-tech-dots'
        )}
        style={{ opacity }}
      />
      {children}
    </div>
  );
};
