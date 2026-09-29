import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  PackageCheck,
  FileText,
  AlertCircle,
  XCircle,
  Banknote
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useCanteen } from '../context/CanteenContext';

interface TokenCardProps {
  order: Order;
  onViewBill?: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'PLACED', label: 'Order Placed', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted by Kitchen', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Cooking in Progress', icon: ChefHat },
  { status: 'READY', label: 'Ready for Pickup', icon: BellRing },
  { status: 'COMPLETED', label: 'Completed', icon: PackageCheck }
];

export const TokenCard: React.FC<TokenCardProps> = ({ order, onViewBill }) => {
  const { cancelOrder } = useCanteen();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isReady = order.status === 'READY';
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';
  const isRejected = order.status === 'REJECTED';

  // Confetti celebration when READY
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

  const handleCancel = async () => {
    if (order.status !== 'PLACED') return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(order.id);
    } catch (err: any) {
      setCancelError(err?.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Ready Alert Banner */}
      {isReady && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl flex items-start gap-3.5 border-2 border-emerald-400"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">
              YOUR ORDER IS READY! 🎉
            </h3>
            <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
              Please present token <strong className="text-white underline font-mono-token text-sm">{order.tokenString}</strong> at SVCE Cafe Counter 1 or 2 to collect your fresh food.
            </p>
          </div>
        </motion.div>
      )}

      {/* Rejection / Cancellation Banner */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-rose-900 text-sm">Order Unable to be Prepared</strong>
            <p className="mt-0.5">{order.rejectionReason || 'Kitchen had to reject this order due to stock availability.'}</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 text-xs text-stone-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-stone-900 text-sm">Order Cancelled</strong>
            <p className="mt-0.5">This order was cancelled before cooking started.</p>
          </div>
        </div>
      )}

      {/* Main Token Display Card */}
      <div
        className={`rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden ${
          isReady
            ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
            : isCancelled || isRejected
            ? 'bg-stone-800'
            : 'bg-stone-900 border border-stone-800'
        }`}
      >
        <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-stone-400 mb-1">
          TOKEN IDENTIFIER
        </p>

        {/* Large Clear Token Number */}
        <motion.div
          key={order.tokenString}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="text-7xl md:text-8xl font-black font-mono-token tracking-tight my-2 text-white"
        >
          {order.tokenString}
        </motion.div>

        <p className="text-xs text-stone-300 font-medium">
          Order ID: <span className="font-mono-token text-orange-400 font-bold">{order.orderNumber}</span>
        </p>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Pickup Point
            </span>
            <span className="text-xs font-bold text-amber-300 block">
              Counter 1 & 2
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Payment
            </span>
            <span
              className={`text-xs font-bold block ${
                order.paymentStatus === 'PAID' ? 'text-emerald-300' : 'text-orange-300'
              }`}
            >
              {order.paymentStatus === 'PAID' ? 'PAID ✓' : 'Pay ₹' + order.total}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">
              Est. Waiting
            </span>
            <span className="text-xs font-bold font-mono-token text-white block">
              {isReady || isCompleted ? '0 min' : `${order.estimatedWaitMin} min`}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Status Tracker (Visible for active/completed orders) */}
      {!isCancelled && !isRejected && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
            Live Order Lifecycle
          </h4>

          <div className="space-y-4">
            {ORDER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              let stepTimestamp: string | null = null;
              if (step.status === 'PLACED') stepTimestamp = formatTime(order.createdAt);
              if (step.status === 'ACCEPTED') stepTimestamp = formatTime(order.acceptedAt);
              if (step.status === 'PREPARING') stepTimestamp = formatTime(order.preparingAt);
              if (step.status === 'READY') stepTimestamp = formatTime(order.readyAt);
              if (step.status === 'COMPLETED') stepTimestamp = formatTime(order.completedAt);

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
                          : 'bg-orange-600 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Label & Details */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-orange-600'
                            : isDone
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {stepTimestamp && (
                        <p className="text-[10px] text-stone-400 font-mono-token">
                          {stepTimestamp}
                        </p>
                      )}
                    </div>
                    {isDone && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Error Notification */}
      {cancelError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Digital Receipt & Actions */}
      <div className="flex items-center gap-2 pt-1">
        {onViewBill && (
          <button
            onClick={onViewBill}
            className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>DIGITAL BILL</span>
          </button>
        )}

        {/* Cancel order allowed ONLY when status is PLACED */}
        {order.status === 'PLACED' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
};
