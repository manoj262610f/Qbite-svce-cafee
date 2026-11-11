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
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#000000] text-white select-none px-6 py-8 cursor-pointer overflow-hidden"
      title="Tap anywhere to skip"
    >
      {/* Top right quick skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-xs text-[#D9D9D9] hover:text-white font-medium flex items-center gap-1 bg-[#151515] border border-white/10 px-3 py-1.5 rounded-full cursor-pointer active:scale-95 transition-colors"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Core Brand Revelation */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative mb-5"
        >
          {/* Official QBite Logo */}
          <div className="w-28 h-28 rounded-full overflow-hidden p-0.5 border border-white/10 flex items-center justify-center relative bg-[#151515]">
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
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-1"
        >
          <h1 className="text-4xl font-black tracking-tight text-white">
            QBite
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#D9D9D9] font-bold">
            SVCE Cafe
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4"
        >
          <p className="text-sm font-bold text-[#D9D9D9]">
            Be Smart. <span className="text-[#FF6B00]">Leave the Queue.</span>
          </p>
        </motion.div>

        {/* Smooth Solid Progress Bar */}
        <div className="w-32 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.25, ease: 'easeInOut' }}
            className="h-full bg-[#FF6B00] rounded-full"
          />
        </div>
      </div>

      {/* Tap hint */}
      <div className="text-[#D9D9D9] text-[11px] font-medium text-center">
        Tap anywhere to enter
      </div>
    </motion.div>
  );
};
