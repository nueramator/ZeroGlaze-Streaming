import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-medium rounded-full transition-colors';

    const variants = {
      default: 'bg-gray-800 text-gray-300 border border-gray-700',
      success: 'bg-green-900/40 text-green-400 border border-green-700',
      warning: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
      danger: 'bg-red-900/40 text-red-400 border border-red-700',
      info: 'bg-blue-900/40 text-blue-400 border border-blue-700',
      purple: 'bg-purple-900/40 text-purple-400 border border-purple-700',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
