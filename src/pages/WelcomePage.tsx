import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
  Monitor,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WelcomePageProps {
  onLoginSuccess: () => void;
  onNavigateToDisplay?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onLoginSuccess,
  onNavigateToDisplay
}) => {
  const { loginWithGoogle, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setLocalError(null);
    clearAuthError();

    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setLocalError(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between p-5 max-w-md mx-auto selection:bg-orange-100">
      {/* Top Header Branding */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-stone-900 block leading-tight">
              QBite
            </span>
            <span className="text-[10px] text-stone-400 font-semibold leading-none">
              SVCE Cafe
            </span>
          </div>
        </div>

        {onNavigateToDisplay && (
          <button
            onClick={onNavigateToDisplay}
            title="Open Live Canteen TV Display"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-[11px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-2xs transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-stone-500" />
            <span>TV Display</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-4">
        {/* Visual Hero Illustration */}
        <div className="relative w-56 h-56 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-400/20 blur-2xl" />
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100">
            <img
              src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
              alt="SVCE Cafe Hot Meals"
              className="w-full h-full object-cover"
            />
            {/* Floating Token Tag */}
            <div className="absolute bottom-3 left-3 right-3 bg-stone-900/90 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-mono-token font-bold text-xs shadow-xs">
                  #47
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 leading-tight">Queue Time Saved</p>
                  <p className="text-xs font-bold text-amber-300 leading-tight">18 minutes</p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Branding Typography */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3 text-orange-600" />
            <span>Official SVCE Food Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-950 tracking-tight leading-tight">
            Be Smart. Leave the Queue.
          </h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed pt-1">
            Order your food before reaching the canteen. Track your token live and pick up with zero waiting.
          </p>
        </div>

        {/* Error Notification Alert */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-[11px] text-rose-900">Sign-In Notice</p>
                <p className="text-[11px] leading-relaxed mt-0.5">{displayedError}</p>
              </div>
              <button
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="text-rose-400 hover:text-rose-700 cursor-pointer p-0.5"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Authentication Box */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="text-center space-y-0.5">
            <h2 className="text-base font-extrabold text-stone-900">
              Sign In to SVCE Cafe
            </h2>
            <p className="text-[11px] text-stone-500">
              One-click Google authentication with your SVCE or personal account
            </p>
          </div>

          {/* Primary Call to Action: Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-extrabold text-sm border-2 border-stone-200 hover:border-orange-500 shadow-xs flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <>
                <span className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-stone-700">Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Icon */}
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="tracking-tight text-stone-900 font-bold">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Privacy & Trust Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Firebase Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Live Token Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-3 border-t border-stone-200/60">
        <p className="text-[11px] text-stone-400">
          QBite for Sri Venkateswara College of Engineering (SVCE) · Bengaluru
        </p>
      </div>
    </div>
  );
};
