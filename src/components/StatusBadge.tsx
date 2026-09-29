import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  const config: Record<
    OrderStatus,
    { label: string; dotClass: string; textClass: string; bgClass: string; borderClass: string }
  > = {
    PLACED: {
      label: 'Placed',
      dotClass: 'bg-amber-400',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20'
    },
    ACCEPTED: {
      label: 'Accepted',
      dotClass: 'bg-blue-400',
      textClass: 'text-blue-400',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20'
    },
    PREPARING: {
      label: 'Cooking',
      dotClass: 'bg-[#FF6A00] animate-pulse',
      textClass: 'text-[#FF7A00]',
      bgClass: 'bg-[#FF6A00]/10',
      borderClass: 'border-[#FF6A00]/30'
    },
    READY: {
      label: 'Ready for Pickup',
      dotClass: 'bg-emerald-400 animate-ping',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30'
    },
    COMPLETED: {
      label: 'Completed',
      dotClass: 'bg-stone-500',
      textClass: 'text-stone-400',
      bgClass: 'bg-white/5',
      borderClass: 'border-white/10'
    },
    CANCELLED: {
      label: 'Cancelled',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/20'
    },
    REJECTED: {
      label: 'Rejected',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/20'
    }
  };

  const current = config[status] || config.PLACED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${
        current.bgClass
      } ${current.borderClass} border ${current.textClass} ${
        isSm ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass}`} />
      <span>{current.label}</span>
    </span>
  );
};
