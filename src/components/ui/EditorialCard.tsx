import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EditorialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  children,
  hoverEffect = true,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl bg-white border border-paper-400 p-6 sm:p-8 transition-all duration-200 shadow-sm',
          hoverEffect && 'hover:bg-paper-100 hover:border-paper-600 hover:shadow-md hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
