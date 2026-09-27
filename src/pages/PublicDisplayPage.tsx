import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, ArrowLeft, Volume2, VolumeX, Sparkles, Clock, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { formatTokenNumber } from '../services/queueService';

interface PublicDisplayPageProps {
  onBack: () => void;
}

export const PublicDisplayPage: React.FC<PublicDisplayPageProps> = ({ onBack }) => {
  const { queueState, orders, settings } = useCanteen();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentServing = queueState.currentServingToken || 42;
  const nextToken = currentServing + 1;

  // Real-time ready tokens from actual active orders
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const readyTokens = readyOrders.length > 0
    ? readyOrders.map((o) => o.tokenString)
    : [formatTokenNumber(Math.max(1, currentServing - 2)), formatTokenNumber(Math.max(1, currentServing - 1))];

  // Real-time preparing tokens
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans">
      {/* Top TV Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-stone-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Exit Display"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
                <span>QBite</span>
                <span className="text-orange-500 font-normal">|</span>
                <span className="text-orange-400 text-2xl md:text-3xl font-bold">SVCE Cafe</span>
              </h1>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold mt-0.5">
                Live Kitchen Pickup Counter Display
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-extrabold font-mono-token text-stone-200">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Large Typography TV Content */}
      <main className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: HUGE NOW SERVING (Col 7) */}
        <div className="lg:col-span-7 bg-stone-900/90 rounded-3xl p-8 md:p-12 border-2 border-orange-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm md:text-base font-extrabold uppercase tracking-[0.3em] text-orange-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
                NOW SERVING
              </span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 px-3 py-1 rounded-xl">
                Pickup Counter 1 & 2
              </span>
            </div>

            {/* Giant Token typography */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentServing}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-7xl sm:text-8xl md:text-9xl font-black font-mono-token tracking-tight text-white my-4 text-center md:text-left drop-shadow-[0_10px_25px_rgba(234,88,12,0.3)]"
              >
                {formatTokenNumber(currentServing)}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-6 border-t border-stone-800 flex items-center justify-between text-stone-400 text-sm font-semibold">
            <span>Please present token on your phone</span>
            <span className="text-orange-400 font-mono-token">Queue updates in real-time</span>
          </div>
        </div>

        {/* Right Column: READY FOR PICKUP & NEXT (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Box 1: READY FOR PICKUP */}
          <div className="flex-1 bg-gradient-to-br from-emerald-950/80 to-teal-950/80 rounded-3xl p-6 md:p-8 border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm md:text-base font-extrabold uppercase tracking-[0.25em] text-emerald-400">
                  READY FOR PICKUP
                </h3>
              </div>

              <div className="flex flex-wrap gap-3 my-2">
                {readyTokens.map((tok) => (
                  <motion.div
                    key={tok}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-5 py-3 rounded-2xl font-mono-token text-3xl md:text-4xl font-extrabold tracking-tight"
                  >
                    {tok}
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="text-xs text-emerald-300 font-medium">
              Orders ready at the canteen collection window
            </p>
          </div>

          {/* Box 2: NEXT IN LINE */}
          <div className="bg-stone-900/90 rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">
                NEXT IN LINE
              </h3>
              <div className="text-4xl md:text-5xl font-black font-mono-token text-amber-400">
                {formatTokenNumber(nextToken)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Currently Preparing
              </span>
              <span className="text-2xl font-extrabold font-mono-token text-stone-200">
                {Math.max(1, preparingOrders.length)} orders
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Announcement Marquee */}
      <footer className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs md:text-sm text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="font-bold text-stone-200">Notice:</span>
          <span>{settings.announcement || 'Order ahead via QBite web app on your phone. Skip the wait!'}</span>
        </div>
        <div className="font-mono-token text-stone-500">
          SVCE Campus Network · Auto-Sync Active
        </div>
      </footer>
    </div>
  );
};
