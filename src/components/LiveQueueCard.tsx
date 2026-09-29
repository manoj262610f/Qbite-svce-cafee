import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, ChefHat, BellRing, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { calculateEstimatedWaitRange } from '../services/queueService';

interface LiveQueueCardProps {
  onTrackQueue: () => void;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({ onTrackQueue }) => {
  const { orders, activeOrder, settings } = useCanteen();

  const isReady = activeOrder?.status === 'READY';
  const isPreparing = activeOrder?.status === 'PREPARING';
  const isPlaced = activeOrder?.status === 'PLACED' || activeOrder?.status === 'ACCEPTED';

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
      className={`rounded-3xl p-4 md:p-5 text-white shadow-xl transition-all relative overflow-hidden ${
        isReady
          ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 ring-2 ring-emerald-400'
          : 'bg-stone-900 border border-stone-800'
      }`}
    >
      {/* Background glow accent */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isReady ? 'bg-emerald-300' : 'bg-orange-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isReady ? 'bg-emerald-400' : 'bg-orange-500'
              }`}
            />
          </span>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-stone-300">
            {isReady ? '🎉 ORDER READY FOR PICKUP' : 'LIVE CANTEEN KITCHEN LOAD'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          <span className={`w-1.5 h-1.5 rounded-full ${settings.status === 'OPEN' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{settings.status}</span>
        </div>
      </div>

      {/* If Student Has an Active Order: Show Token & Real Progress */}
      {activeOrder ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                YOUR ACTIVE TOKEN
              </p>
              <div className="text-4xl md:text-5xl font-black font-mono-token text-white mt-0.5">
                <span className={isReady ? 'text-emerald-300' : 'text-orange-400'}>
                  {activeOrder.tokenString}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium mt-0.5">
                {isReady && 'Ready at Counter 1 & 2! Show this screen to collect.'}
                {isPreparing && 'Chefs are currently cooking your meal.'}
                {isPlaced && 'Order placed with kitchen. Queued for cooking.'}
              </p>
            </div>

            <button
              onClick={onTrackQueue}
              className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <span>Track Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Status</span>
              <span className="font-extrabold text-amber-300 capitalize">{activeOrder.status}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Est. Wait</span>
              <span className="font-mono-token font-bold text-white">
                {isReady ? '0 min' : `${activeOrder.estimatedWaitMin} min`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Items</span>
              <span className="font-mono-token font-bold text-white">
                {activeOrder.items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* General Kitchen Workload Overview */
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                ACTIVE QUEUE
              </p>
              <div className="text-2xl font-black font-mono-token text-white">
                {activeOrdersCount}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">Orders</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                COOKING NOW
              </p>
              <div className="text-2xl font-black font-mono-token text-amber-400">
                {preparingCount}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">In Kitchen</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                READY TO PICK
              </p>
              <div className="text-2xl font-black font-mono-token text-emerald-400">
                {readyCount}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">At Counter</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
            <span>Estimated queue wait: ~{calculateEstimatedWaitRange(orders).displayRange}</span>
            <span className="text-orange-400 font-bold">Fast counter pickup</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
