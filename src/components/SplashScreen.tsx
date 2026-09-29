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
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-5"
        >
          {/* Logo container with dark glass surface & orange glow */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] p-0.5 border border-white/15 shadow-2xl glow-orange-lg flex items-center justify-center relative overflow-hidden">
            {/* Subtle rotating glow ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-1 rounded-full border border-dashed border-[#FF6A00]/40"
            />

            {/* Custom SVG mark: Geometric "q" formed with a token ring & bite cutout */}
            <svg
              viewBox="0 0 32 32"
              className="w-12 h-12 relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C18.2 26 20.22 25.29 21.87 24.1L24.5 26.5C24.8 26.8 25.3 26.6 25.3 26.2V15C25.3 10.03 21.14 6 16 6ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z"
                fill="#FFFFFF"
              />
              <circle cx="16" cy="16" r="3.2" fill="#FF6A00" />
              <circle cx="21" cy="11" r="1.5" fill="#FF9D2E" />
            </svg>
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
            q<span className="text-[#FF6A00]">Bite</span>
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
