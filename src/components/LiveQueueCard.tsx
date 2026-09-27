import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { formatTokenNumber } from '../services/queueService';

interface LiveQueueCardProps {
  onTrackQueue: () => void;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({ onTrackQueue }) => {
  const { queueState, activeOrder, orders } = useCanteen();

  const currentServing = queueState.currentServingToken || 42;
  const studentToken = activeOrder ? activeOrder.tokenNumber : null;
  const isReady = activeOrder?.status === 'READY';

  // Calculate live orders ahead
  const ordersAhead = studentToken
    ? Math.max(0, studentToken - currentServing)
    : 0;

  const estimatedWaitMin = activeOrder
    ? activeOrder.estimatedWaitMin
    : Math.max(2, (queueState.lastToken - currentServing) * 2 + 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 md:p-5 text-white shadow-lg transition-all relative overflow-hidden ${
        isReady
          ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 ring-2 ring-emerald-400/50'
          : 'bg-stone-900 border border-stone-800'
      }`}
    >
      {/* Background visual accents */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isReady ? 'bg-emerald-300' : 'bg-orange-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isReady ? 'bg-emerald-400' : 'bg-orange-500'}`} />
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-stone-300">
            {isReady ? '🎉 ORDER READY' : 'LIVE CANTEEN QUEUE'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium">
          <Clock className="w-3 h-3 text-orange-400" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Main Grid: NOW SERVING vs YOUR TOKEN */}
      <div className="grid grid-cols-2 gap-3 items-center mb-4">
        {/* Left: NOW SERVING */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-0.5">
            NOW SERVING
          </p>
          <motion.div
            key={currentServing}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-extrabold font-mono-token tracking-tight text-white flex items-center gap-1"
          >
            <span>{formatTokenNumber(currentServing)}</span>
          </motion.div>
          <span className="text-[10px] text-orange-400 font-medium">Pickup Counter 1</span>
        </div>

        {/* Right: YOUR TOKEN OR QUEUE STATUS */}
        <div className={`rounded-xl p-3 border ${
          studentToken
            ? isReady
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
              : 'bg-orange-500/10 border-orange-500/30 text-orange-100'
            : 'bg-white/5 border-white/5'
        }`}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-0.5">
            {studentToken ? 'YOUR TOKEN' : 'TOTAL IN QUEUE'}
          </p>
          <div className="text-3xl font-extrabold font-mono-token tracking-tight text-white">
            {studentToken ? (
              <span className={isReady ? 'text-emerald-300' : 'text-orange-400'}>
                {formatTokenNumber(studentToken)}
              </span>
            ) : (
              <span>{Math.max(0, queueState.lastToken - currentServing)}</span>
            )}
          </div>
          <span className="text-[10px] text-stone-300 font-medium">
            {studentToken
              ? isReady
                ? 'Ready for pickup!'
                : `${ordersAhead} ahead of you`
              : 'Active orders waiting'}
          </span>
        </div>
      </div>

      {/* Quick Status Subline */}
      {studentToken && (
        <div className="flex items-center justify-between text-xs text-stone-300 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            <span>
              {isReady ? (
                <strong className="text-emerald-300">Collect now at counter</strong>
              ) : (
                <strong>{ordersAhead} {ordersAhead === 1 ? 'order' : 'orders'} ahead</strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isReady ? '0 min wait' : `Est. ${estimatedWaitMin} min`}
            </span>
          </div>
        </div>
      )}

      {/* Button to Track Live Queue / Dedicated Token View */}
      <button
        onClick={onTrackQueue}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
          isReady
            ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md font-extrabold'
            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-105 shadow-md shadow-orange-500/20'
        }`}
      >
        <span>{studentToken ? (isReady ? 'SHOW TOKEN FOR PICKUP' : 'TRACK LIVE QUEUE') : 'VIEW LIVE QUEUE DISPLAY'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
