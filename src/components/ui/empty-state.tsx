import * as React from 'react';
import Link from 'next/link';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-100 rounded-3xl shadow-2xs max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5 mb-6 leading-relaxed">
        {description}
      </p>

      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}

      {!actionHref && onAction && actionLabel && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
