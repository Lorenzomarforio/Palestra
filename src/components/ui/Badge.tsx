import { ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    dot && 'badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}