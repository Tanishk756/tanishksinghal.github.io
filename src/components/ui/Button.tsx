import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isExternal?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconPosition = 'right',
  isExternal,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ink-900/20 disabled:opacity-40 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-full',
    md: 'text-sm px-5 py-2.5 gap-2 rounded-full',
    lg: 'text-base px-7 py-3.5 gap-2.5 rounded-full',
  };

  const variantStyles = {
    primary: 'bg-ink-900 text-paper-100 hover:bg-ink-800 shadow-sm hover:shadow active:scale-[0.98]',
    secondary: 'bg-paper-200 text-ink-900 hover:bg-paper-300 border border-paper-400 active:scale-[0.98]',
    outline: 'bg-transparent text-ink-900 hover:bg-paper-200 border border-paper-500 hover:border-ink-900 active:scale-[0.98]',
    ghost: 'bg-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-200/60',
  };

  const combinedClasses = twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className));

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={combinedClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

