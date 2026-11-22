import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 shadow-xs',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/15',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
