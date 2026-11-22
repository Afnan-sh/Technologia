import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'blue';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-gray-200/60',
    secondary: 'bg-slate-50 text-slate-600 border-gray-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-100/60 font-mono',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
