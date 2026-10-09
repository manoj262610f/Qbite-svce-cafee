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
  QrCode,
  CalendarClock,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useCanteen } from '../context/CanteenContext';
import { getTimeRemainingUntilPickup, canRescheduleOrCancel } from '../services/scheduleService';
import { ScheduleSelectorModal } from './ScheduleSelectorModal';

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
  const { cancelOrder, settings } = useCanteen();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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
          className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-2xl flex items-start gap-3.5 border border-emerald-400/50 glow-emerald-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center shrink-0 animate-bounce">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">
              HOT & READY FOR PICKUP!
            </h3>
            <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
              Show token <strong className="text-white font-mono-token text-sm underline">{order.tokenString}</strong> at Counter 1 & 2 to collect your meal.
            </p>
          </div>
        </motion.div>
      )}

      {/* Rejection / Cancellation Banner */}
      {isRejected && (
        <div className="bg-[#1C1111] border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white text-sm">Order Unable to be Prepared</strong>
            <p className="mt-0.5 text-stone-400">{order.rejectionReason || 'Kitchen had to reject this order due to stock availability.'}</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-xs text-stone-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white text-sm">Order Cancelled</strong>
            <p className="mt-0.5 text-stone-400">This order was cancelled before cooking started.</p>
          </div>
        </div>
      )}

      {/* Main Token Display Card */}
      <div
        className={`rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden border ${
          isReady
            ? 'bg-gradient-to-br from-[#0D261B] to-[#071710] border-emerald-500/40 glow-emerald-sm'
            : isCancelled || isRejected
            ? 'bg-[#141414] border-white/8 opacity-80'
            : 'bg-gradient-to-br from-[#1C1C1C] via-[#141414] to-[#0D0D0D] border-white/10 glow-orange-sm'
        }`}
      >
        <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#A1A1A1] mb-1">
          TOKEN IDENTIFIER
        </p>

        {/* Large Clear Token Number */}
        <motion.div
          key={order.tokenString}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`text-7xl md:text-8xl font-black font-mono-token tracking-tight my-2 ${
            isReady ? 'text-emerald-400' : 'text-[#FF6A00]'
          }`}
        >
          {order.tokenString}
        </motion.div>

        <p className="text-xs text-[#A1A1A1] font-medium">
          Order ID: <span className="font-mono-token text-white font-bold">{order.orderNumber}</span>
        </p>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/8 text-center">
          <div className="bg-[#0A0A0A]/60 rounded-2xl p-2.5 border border-white/5">
            <span className="text-[10px] text-[#A1A1A1] uppercase font-bold block mb-0.5">
              Pickup Point
            </span>
            <span className="text-xs font-black text-[#FF9D2E] block">
              Counter 1 & 2
            </span>
          </div>

          <div className="bg-[#0A0A0A]/60 rounded-2xl p-2.5 border border-white/5">
            <span className="text-[10px] text-[#A1A1A1] uppercase font-bold block mb-0.5">
              Payment
            </span>
            <span
              className={`text-xs font-black block ${
                order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-[#FF7A00]'
              }`}
            >
              {order.paymentStatus === 'PAID' ? 'PAID ✓' : 'Pay ₹' + order.total}
            </span>
          </div>

          <div className="bg-[#0A0A0A]/60 rounded-2xl p-2.5 border border-white/5">
            <span className="text-[10px] text-[#A1A1A1] uppercase font-bold block mb-0.5">
              Est. Waiting
            </span>
            <span className="text-xs font-black font-mono-token text-white block">
              {isReady || isCompleted ? '0 min' : `${order.estimatedWaitMin} min`}
            </span>
          </div>
        </div>
      </div>

      {/* Scheduled Order Details Banner */}
      {order.orderType === 'scheduled' && (() => {
        const timing = getTimeRemainingUntilPickup(order.scheduledPickupAt);
        return (
          <div className="bg-gradient-to-r from-[#1C160F] to-[#141414] rounded-3xl p-4 border border-[#FF6A00]/40 shadow-xl glow-orange-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#FF7A00] flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" />
                <span>Scheduled Pickup Order</span>
              </span>
              <span className={`text-[10px] font-mono-token font-bold px-2 py-0.5 rounded-full ${
                timing.isUrgent
                  ? 'bg-[#FF6A00] text-black'
                  : 'bg-white/10 text-stone-200'
              }`}>
                {timing.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>{order.scheduledDate}</span>
              </span>
              <span className="font-mono-token font-black text-[#FF6A00]">
                {order.scheduledTimeSlot || timing.formattedTime}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Timeline Status Tracker (Visible for active/completed orders) */}
      {!isCancelled && !isRejected && (
        <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-[#A1A1A1] mb-4">
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
                        currentIndex > idx ? 'bg-[#FF6A00]' : 'bg-white/10'
                      }`}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? isReady && step.status === 'READY'
                          ? 'bg-emerald-500 text-black ring-4 ring-emerald-500/30'
                          : 'bg-[#FF6A00] text-black font-black'
                        : 'bg-[#1F1F1F] text-stone-500 border border-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* Label & Details */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-[#FF6A00]'
                            : isDone
                            ? 'text-white'
                            : 'text-stone-500'
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
                      <span className="text-[10px] text-emerald-400 font-bold font-mono-token">
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
        <div className="p-3 bg-[#1C1111] border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Digital Receipt & Actions */}
      <div className="flex items-center gap-2 pt-1">
        {onViewBill && (
          <button
            onClick={onViewBill}
            className="flex-1 py-3 px-4 rounded-2xl border border-white/10 bg-[#161616] hover:bg-[#202020] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-[#FF6A00]" />
            <span>VIEW DIGITAL BILL</span>
          </button>
        )}

        {/* Reschedule & Cancel buttons allowed ONLY when status is PLACED */}
        {order.status === 'PLACED' && (
          <>
            {order.orderType === 'scheduled' && (() => {
              const check = canRescheduleOrCancel(order, settings.cancelCutoffMinutes ?? 30);
              return check.allowed ? (
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className="py-3 px-3.5 rounded-2xl border border-[#FF6A00]/40 bg-[#261E14] hover:bg-[#332617] text-[#FF9D2E] font-extrabold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
              ) : null;
            })()}

            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="py-3 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-extrabold text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </>
        )}
      </div>

      {showRescheduleModal && (
        <ScheduleSelectorModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          orderIdToReschedule={order.id}
          title="Reschedule Pickup Time"
          subtitle={`Pick a new pickup slot for token ${order.tokenString}`}
        />
      )}
    </div>
  );
};
