import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Users,
  CheckCircle2,
  ChefHat,
  BellRing,
  PackageCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useCanteen } from '../context/CanteenContext';
import { formatTokenNumber } from '../services/queueService';

interface TokenCardProps {
  order: Order;
  onViewBill?: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'PLACED', label: 'Order Placed', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready for Pickup', icon: BellRing },
  { status: 'COMPLETED', label: 'Completed', icon: PackageCheck }
];

export const TokenCard: React.FC<TokenCardProps> = ({ order, onViewBill }) => {
  const { queueState, cancelOrder } = useCanteen();

  const currentServing = queueState.currentServingToken || 42;
  const isReady = order.status === 'READY';
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';

  const ordersAhead = Math.max(0, order.tokenNumber - currentServing);

  // Trigger celebration confetti when order transitions to READY
  useEffect(() => {
    if (isReady) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isReady]);

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="space-y-4">
      {/* Ready Alert Banner */}
      {isReady && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-600 text-white rounded-2xl p-4 shadow-lg flex items-start gap-3.5 border-2 border-emerald-400"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">
              YOUR ORDER IS READY! 🎉
            </h3>
            <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
              Please collect token <strong className="text-white underline font-mono-token">{order.tokenString}</strong> immediately from the QBite pickup counter.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Token Display Card */}
      <div className={`rounded-3xl p-5 md:p-6 text-white text-center shadow-xl relative overflow-hidden ${
        isReady
          ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
          : 'bg-stone-900 border border-stone-800'
      }`}>
        <p className="text-xs uppercase font-bold tracking-[0.2em] text-stone-400 mb-1">
          YOUR TOKEN
        </p>

        {/* Large Clear Token Number */}
        <motion.div
          key={order.tokenString}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="text-6xl md:text-7xl font-extrabold font-mono-token tracking-tight my-2 text-white"
        >
          {order.tokenString}
        </motion.div>

        <p className="text-xs text-stone-300 font-medium">
          Order ID: <span className="font-mono-token text-orange-400 font-bold">{order.orderNumber}</span>
        </p>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Serving Now
            </span>
            <span className="text-xl font-bold font-mono-token text-amber-400">
              {formatTokenNumber(currentServing)}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Orders Ahead
            </span>
            <span className="text-xl font-bold font-mono-token text-white">
              {isReady || isCompleted ? 0 : ordersAhead}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Est. Waiting
            </span>
            <span className="text-xl font-bold font-mono-token text-orange-400">
              {isReady || isCompleted ? '0 min' : `${order.estimatedWaitMin} min`}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Status Tracker */}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
          Order Timeline
        </h4>

        <div className="space-y-4">
          {ORDER_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentIndex >= idx;
            const isCurrent = currentIndex === idx;

            return (
              <div key={step.status} className="flex items-center gap-3 relative">
                {/* Connecting Line */}
                {idx < ORDER_STEPS.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-6 -translate-x-1/2 transition-colors ${
                      currentIndex > idx ? 'bg-orange-500' : 'bg-stone-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? isReady && step.status === 'READY'
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                        : 'bg-orange-500 text-white'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label & Details */}
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-orange-600'
                          : isDone
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && !isCompleted && (
                      <p className="text-[11px] text-stone-500">
                        {step.status === 'PLACED' && 'Waiting for kitchen acceptance'}
                        {step.status === 'ACCEPTED' && 'Order acknowledged by kitchen counter'}
                        {step.status === 'PREPARING' && 'Chef is cooking your fresh items'}
                        {step.status === 'READY' && 'Counter pickup counter active'}
                      </p>
                    )}
                  </div>
                  {isDone && (
                    <span className="text-[10px] text-stone-400 font-mono-token">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-World Pickup Guidance Card */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {isReady ? 'Show token # ' + order.tokenString : 'Your food is being prepared'}
          </p>
          <p className="text-amber-800 leading-relaxed">
            {isReady
              ? 'Head over to SVCE Cafe Counter 1 or 2. Show this screen to collect your warm food.'
              : 'You don\'t need to stand in the crowded queue. We will notify you when it\'s ready.'}
          </p>
        </div>
      </div>

      {/* Digital Receipt & Actions */}
      <div className="flex items-center gap-2 pt-1">
        {onViewBill && (
          <button
            onClick={onViewBill}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>VIEW DIGITAL BILL</span>
          </button>
        )}

        {order.status === 'PLACED' && (
          <button
            onClick={() => cancelOrder(order.id)}
            className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};
