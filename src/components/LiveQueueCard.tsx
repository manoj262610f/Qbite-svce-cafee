import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChefHat, BellRing } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { calculateEstimatedWaitRange } from '../services/queueService';
import { OrderStatusStepper } from './OrderStatusStepper';

interface LiveQueueCardProps {
  onTrackQueue: () => void;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({ onTrackQueue }) => {
  const { orders, activeOrder, settings } = useCanteen();

  const isReady = activeOrder?.status === 'READY';

  // Real operational counts from Firestore
  const activeOrdersCount = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
  ).length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-4 md:p-5 text-white shadow-2xl transition-all relative overflow-hidden border ${
        isReady
          ? 'bg-gradient-to-br from-[#0F291E] via-[#0A1F16] to-[#05140D] border-emerald-500/40 glow-emerald-sm'
          : 'bg-gradient-to-br from-[#181818] via-[#121212] to-[#0A0A0A] border-white/10 hover:border-[#FF6A00]/30'
      }`}
    >
      {/* Background orange atmospheric glow */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isReady ? 'bg-emerald-400' : 'bg-[#FF6A00]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isReady ? 'bg-emerald-400' : 'bg-[#FF6A00]'
              }`}
            />
          </span>
          <span className="text-[10px] font-black tracking-widest uppercase text-stone-300">
            {isReady ? 'FOOD READY FOR PICKUP' : 'LIVE CANTEEN STATUS'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/8">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              settings.status === 'OPEN' ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span>{settings.status}</span>
        </div>
      </div>

      {/* If Student Has an Active Order: Show Token & Real Progress */}
      {activeOrder ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black text-[#A1A1A1] tracking-widest">
                YOUR LIVE TOKEN
              </p>
              <div className="text-4xl md:text-5xl font-black font-mono-token tracking-tight text-white mt-0.5 flex items-baseline gap-2">
                <span className={isReady ? 'text-emerald-400' : 'text-[#FF6A00]'}>
                  {activeOrder.tokenString}
                </span>
                <span className="text-xs font-normal text-stone-400">
                  #{activeOrder.orderNumber.slice(-4)}
                </span>
              </div>
            </div>

            <button
              onClick={onTrackQueue}
              className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 shadow-md ${
                isReady
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-black glow-emerald-sm'
                  : 'bg-[#FF6A00] hover:bg-[#FF7A00] text-black glow-orange-sm'
              }`}
            >
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Real-time Order Status Stepper */}
          <OrderStatusStepper
            status={activeOrder.status}
            estimatedWaitMin={activeOrder.estimatedWaitMin}
          />
        </div>
      ) : (
        /* General Kitchen Workload Overview */
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#141414] rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-[#A1A1A1] mb-0.5">
                ACTIVE QUEUE
              </p>
              <div className="text-2xl font-black font-mono-token text-white">
                {activeOrdersCount}
              </div>
              <span className="text-[10px] text-stone-500 font-medium">Orders</span>
            </div>

            <div className="bg-[#141414] rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-[#A1A1A1] mb-0.5">
                COOKING NOW
              </p>
              <div className="text-2xl font-black font-mono-token text-[#FF9D2E]">
                {preparingCount}
              </div>
              <span className="text-[10px] text-stone-500 font-medium">In Kitchen</span>
            </div>

            <div className="bg-[#141414] rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-[#A1A1A1] mb-0.5">
                READY TO PICK
              </p>
              <div className="text-2xl font-black font-mono-token text-emerald-400">
                {readyCount}
              </div>
              <span className="text-[10px] text-stone-500 font-medium">At Counter</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-[#A1A1A1]">
            <span>Est. Wait: ~{calculateEstimatedWaitRange(orders).displayRange}</span>
            <span className="text-[#FF7A00] font-bold">Counter 1 & 2 Pickup</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
