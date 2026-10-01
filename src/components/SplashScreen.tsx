import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Premium fast startup (1.35 seconds max)
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 1350);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    onCompleteRef.current();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#050505] text-white select-none px-6 py-8 cursor-pointer overflow-hidden"
      title="Tap anywhere to skip"
    >
      {/* Top right quick skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-xs text-stone-400 hover:text-white font-medium flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer active:scale-95 transition-all"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Atmospheric Orange Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#FF6A00]/15 blur-[100px] pointer-events-none -top-16" />
      <div className="absolute w-72 h-72 rounded-full bg-[#FF9D2E]/10 blur-[80px] pointer-events-none -bottom-16" />

      {/* Core Brand Revelation */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-5"
        >
          {/* Official QBite Logo */}
          <div className="w-28 h-28 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-2xl glow-orange-lg flex items-center justify-center relative bg-[#0D0D0D]">
            <img
              src="/icons/qbite-icon-512.png"
              alt="QBite – SVCE Cafe"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-1"
        >
          <h1 className="text-4xl font-black tracking-tight text-white">
            QBite
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#A1A1A1] font-bold">
            SVCE Cafe
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4"
        >
          <p className="text-sm font-bold text-stone-200">
            Order Smart. <span className="text-[#FF7A00]">Skip the Queue.</span>
          </p>
        </motion.div>

        {/* Fast Smooth Progress Bar */}
        <div className="w-32 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.25, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] rounded-full glow-orange-sm"
          />
        </div>
      </div>

      {/* Tap hint */}
      <div className="text-stone-600 text-[11px] font-medium text-center">
        Tap anywhere to enter
      </div>
    </motion.div>
  );
};
