import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
      outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
      subtle: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-sm sm:text-base px-6 py-2.5 rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl h-9 w-9',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
