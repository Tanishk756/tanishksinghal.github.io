import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative pb-8 border-b border-paper-400 flex flex-col md:flex-row md:items-end justify-between gap-6',
          align === 'center' && 'text-center md:items-center',
          className
        )
      )}
    >
      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest-tech text-stone-500 font-medium">
            {eyebrow}
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-ink-900 tracking-tight leading-[1.08]">
          {title}
        </h2>
        {description && (
          <p className="text-base sm:text-lg text-ink-600 font-sans leading-relaxed font-light">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

