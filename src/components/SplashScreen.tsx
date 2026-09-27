import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, UtensilsCrossed, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Step 0: Initial Brand Display (0 - 700ms)
    const t1 = setTimeout(() => setStep(1), 700);
    // Step 1: "Be Smart. Leave the Queue." (700ms - 1700ms)
    const t2 = setTimeout(() => setStep(2), 1600);
    // Step 2: "Order ahead. Pick up faster." -> Complete after 2.8 seconds
    const t3 = setTimeout(() => {
      onCompleteRef.current();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // Empty dependency array ensures timer runs uninterrupted!

  const handleSkip = () => {
    onCompleteRef.current();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-stone-950 text-white select-none px-6 py-8 cursor-pointer"
      title="Click or tap anywhere to continue"
    >
      {/* Top right quick skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-xs text-stone-400 hover:text-white font-medium flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs cursor-pointer active:scale-95 transition-all"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Background Ambient Warm Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-orange-600/20 blur-3xl pointer-events-none -top-10" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -bottom-10" />

      <div className="relative flex flex-col items-center text-center max-w-sm w-full my-auto">
        {/* Animated Brand Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 p-0.5 shadow-2xl shadow-orange-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Rotating token countdown ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-1 rounded-full border border-dashed border-orange-500/40"
              />
              <div className="flex items-center gap-1 text-orange-400">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          {/* Subtle token pulse badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -bottom-2 -right-2 bg-amber-400 text-stone-950 text-[10px] font-mono-token font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5"
          >
            <Clock className="w-2.5 h-2.5" />
            #047
          </motion.div>
        </motion.div>

        {/* Primary App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2"
        >
          <span>QBite</span>
        </motion.h1>

        {/* Secondary Brand Location */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-xs uppercase tracking-[0.25em] text-orange-400 font-semibold mt-1"
        >
          SVCE Cafe
        </motion.p>

        {/* Sequential Tagline Transitions */}
        <div className="h-16 flex flex-col items-center justify-center mt-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-lg font-bold text-stone-100">
                  Be Smart. <span className="text-orange-400">Leave the Queue.</span>
                </p>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-base font-medium text-stone-300">
                  Order ahead. <span className="text-amber-300 font-semibold">Pick up faster.</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Startup Loading Bar */}
        <div className="w-36 h-1 bg-stone-800 rounded-full mt-4 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
          />
        </div>
      </div>

      {/* Tap anywhere hint */}
      <div className="text-stone-500 text-[11px] font-medium text-center">
        Tap anywhere to enter
      </div>
    </motion.div>
  );
};
