import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-700 border-t-purple-500',
          sizes[size],
          className
        )}
      />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <LoadingSpinner size="xl" text="Loading..." />
    </div>
  );
}

export function ComponentLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  );
}
