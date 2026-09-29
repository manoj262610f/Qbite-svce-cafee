import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, ChefHat, Sparkles, PackageCheck, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderStatusStepperProps {
  status: OrderStatus;
  className?: string;
  estimatedWaitMin?: number;
}

const STEPS: { key: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'PLACED', label: 'Placed', icon: Clock },
  { key: 'ACCEPTED', label: 'Accepted', icon: Check },
  { key: 'PREPARING', label: 'Cooking', icon: ChefHat },
  { key: 'READY', label: 'Ready', icon: Sparkles },
  { key: 'COMPLETED', label: 'Picked Up', icon: PackageCheck }
];

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  status,
  className = '',
  estimatedWaitMin
}) => {
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className={`p-4 rounded-2xl bg-[#1C1111] border border-rose-500/20 text-rose-300 flex items-center gap-3 ${className}`}>
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <div>
          <p className="font-extrabold text-sm text-white">Order {status}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {status === 'CANCELLED' ? 'You cancelled this order.' : 'The kitchen could not fulfill this order.'}
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Track */}
      <div className="relative flex items-center justify-between">
        {/* Track Line Background */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full z-0" />
        
        {/* Active Progress Fill */}
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] rounded-full z-0"
          initial={false}
          animate={{
            width: `${(activeIdx / (STEPS.length - 1)) * 100}%`
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#FF6A00] text-black ring-4 ring-[#FF6A00]/30 shadow-lg glow-orange-sm'
                    : isDone
                    ? 'bg-[#FF6A00]/20 border border-[#FF6A00] text-[#FF6A00]'
                    : 'bg-[#181818] border border-white/10 text-stone-500'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </motion.div>

              <span
                className={`text-[10px] font-bold mt-1.5 transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#FF6A00]'
                    : isDone
                    ? 'text-white'
                    : 'text-stone-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic current status narrative */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-ping" />
          <span className="text-xs font-bold text-white">
            {status === 'PLACED' && 'Order received. Kitchen will accept shortly.'}
            {status === 'ACCEPTED' && 'Order confirmed. Queued for preparation.'}
            {status === 'PREPARING' && 'Kitchen chefs are cooking your meal.'}
            {status === 'READY' && 'Hot & ready! Pick up at Counter 1 & 2.'}
            {status === 'COMPLETED' && 'Order completed and collected.'}
          </span>
        </div>

        {status !== 'COMPLETED' && status !== 'READY' && estimatedWaitMin && (
          <span className="text-xs font-mono-token font-bold text-[#FF9D2E] bg-white/5 px-2 py-0.5 rounded-lg shrink-0">
            ~{estimatedWaitMin} min
          </span>
        )}
      </div>
    </div>
  );
};
