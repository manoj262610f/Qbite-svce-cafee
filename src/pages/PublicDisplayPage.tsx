import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, ArrowLeft, BellRing, ChefHat, Volume2, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { calculateEstimatedWaitRange } from '../services/queueService';
import { QbiteLogo } from '../components/QbiteLogo';

interface PublicDisplayPageProps {
  onBack: () => void;
}

export const PublicDisplayPage: React.FC<PublicDisplayPageProps> = ({ onBack }) => {
  const { orders, settings } = useCanteen();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Real operational orders from Firestore
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Top TV Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-[#151515] hover:bg-white/10 text-[#D9D9D9] hover:text-white border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
            title="Exit Display"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <QbiteLogo size="lg" />
            <div className="pl-3 border-l border-white/10 hidden sm:block">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6B00] block">
                Digital Pickup Board
              </span>
              <span className="text-xs text-[#D9D9D9]">Counters 1 & 2 Live Queue</span>
            </div>
          </div>
        </div>

        {/* Live Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl md:text-4xl font-black font-mono-token text-white">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-xs uppercase tracking-widest text-[#D9D9D9] font-bold">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 rounded-2xl bg-[#151515] hover:bg-white/10 border border-white/10 text-[#D9D9D9] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main TV Content Grid */}
      <main className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Column: READY FOR PICKUP TOKENS (Col 8) */}
        <div className="lg:col-span-8 bg-[#151515] rounded-3xl p-8 md:p-10 border-2 border-emerald-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/20">
              <span className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                <BellRing className="w-5 h-5 text-emerald-400" />
                READY FOR PICKUP
              </span>
              <span className="text-xs md:text-sm font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
                Counters 1 & 2
              </span>
            </div>

            {/* Token Numbers Grid */}
            {readyOrders.length === 0 ? (
              <div className="py-16 text-center text-[#D9D9D9]">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-white/30" />
                <p className="text-xl md:text-2xl font-black text-white">
                  No orders ready for pickup right now
                </p>
                <p className="text-sm text-[#D9D9D9] mt-1">
                  Orders currently in the kitchen will be called as soon as cooking completes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-4">
                <AnimatePresence>
                  {readyOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      className="bg-[#000000] border-2 border-emerald-400/60 rounded-3xl p-5 text-center shadow-lg"
                    >
                      <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono-token text-emerald-300">
                        {order.tokenString}
                      </div>
                      <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-1">
                        Collect Food
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-emerald-500/20 flex items-center justify-between text-emerald-300/80 text-sm font-medium">
            <span>Please present your digital token at the pickup counter</span>
            <span className="font-mono-token font-bold text-emerald-400">Real-Time Kitchen Sync</span>
          </div>
        </div>

        {/* Right Column: PREPARING COUNT & STATUS (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Box 1: PREPARING / COOKING IN KITCHEN */}
          <div className="flex-1 bg-[#151515] rounded-3xl p-6 md:p-8 border-2 border-[#FF6B00]/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-[#FF6B00]">
                  COOKING IN KITCHEN
                </h3>
              </div>

              <div className="my-3 text-center">
                <div className="text-6xl md:text-7xl font-black font-mono-token text-white">
                  {preparingOrders.length}
                </div>
                <p className="text-xs uppercase font-bold text-[#D9D9D9] mt-1">
                  Active orders currently on stoves
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-[#D9D9D9] text-center font-medium">
              Estimated wait: ~{calculateEstimatedWaitRange(orders).displayRange}
            </div>
          </div>

          {/* Box 2: CAFETERIA OPERATIONAL STATUS & NOTICE */}
          <div className="bg-[#151515] rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-wider text-[#D9D9D9]">
                CANTEEN STATUS
              </span>
              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-xl ${
                  settings.status === 'OPEN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : settings.status === 'BUSY'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {settings.status}
              </span>
            </div>

            {settings.announcement && (
              <div className="p-3 bg-[#000000] rounded-2xl border border-white/10 flex items-start gap-2.5">
                <Volume2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <p className="text-xs text-[#D9D9D9] leading-relaxed">
                  {settings.announcement}
                </p>
              </div>
            )}

            <div className="text-[11px] text-[#D9D9D9] flex items-center justify-between pt-1">
              <span>Operating Hours:</span>
              <span className="text-white font-bold">{settings.operatingHours || '7:30 AM – 5:30 PM'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ticker */}
      <footer className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#D9D9D9] relative z-10">
        <div>
          <span>QBite Smart Canteen Platform · Sri Venkateswara College of Engineering</span>
        </div>
        <div>
          <span className="text-[#FF6B00] font-bold">Be Smart. Leave the Queue.</span>
        </div>
      </footer>
    </div>
  );
};
