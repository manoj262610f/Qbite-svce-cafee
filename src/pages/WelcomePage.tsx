import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
  Monitor,
  X,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QbiteLogo } from '../components/QbiteLogo';

interface WelcomePageProps {
  onLoginSuccess: (targetRole?: string) => void;
  onNavigateToDisplay?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onLoginSuccess,
  onNavigateToDisplay
}) => {
  const { loginWithGoogle, authError, authErrorDetails, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleGoogleSignIn = async (useRedirect = false) => {
    if (useRedirect) {
      setIsRedirecting(true);
    } else {
      setIsSigningIn(true);
    }
    setLocalError(null);
    clearAuthError();

    try {
      const res = await loginWithGoogle(useRedirect);
      if (res) {
        console.log('[AUTH] Login completed successfully for role:', res.role);
        onLoginSuccess(res.role);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in encountered an issue. Please try again.';
      setLocalError(msg);
    } finally {
      setIsSigningIn(false);
      setIsRedirecting(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-5 max-w-md mx-auto selection:bg-[#FF6A00] selection:text-black relative overflow-hidden">
      {/* Ambient Orange Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#FF6A00]/10 blur-[120px] pointer-events-none -top-20 -right-20" />
      <div className="absolute w-80 h-80 rounded-full bg-[#FF9D2E]/8 blur-[100px] pointer-events-none -bottom-20 -left-20" />

      {/* Top Header Branding */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <QbiteLogo size="md" />

        {onNavigateToDisplay && (
          <button
            onClick={onNavigateToDisplay}
            title="Open Live Canteen TV Display"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 text-[11px] font-bold text-stone-300 hover:text-white cursor-pointer shadow-md transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>TV Display</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-4 relative z-10">
        {/* Official QBite Brand Revelation */}
        <div className="text-center mb-6">
          <div className="relative inline-block mx-auto mb-3">
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 bg-[#0D0D0D] border border-white/20 shadow-2xl glow-orange-lg flex items-center justify-center mx-auto overflow-hidden">
              <img
                src="/icons/qbite-icon-512.png"
                alt="QBite – SVCE Cafe"
                className="w-full h-full object-contain rounded-full select-none"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
            {/* Live Token Status Pill */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#181818] border border-[#FF6A00]/40 text-[#FF7A00] text-[10px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FF6A00]" />
              <span>SVCE Campus Cafe</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            QBite
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#A1A1A1] font-bold mt-0.5">
            SVCE Cafe
          </p>
          <p className="text-sm font-bold text-[#FF7A00] mt-2">
            Order Smart. Skip the Queue.
          </p>
          <p className="text-xs text-[#A1A1A1] max-w-xs mx-auto leading-relaxed pt-1">
            Order meals ahead from campus. Track your live token and pick up fresh hot food with zero waiting.
          </p>
        </div>

        {/* Error Notification Alert */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3.5 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs shadow-md flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-[11px] text-white">Sign-In Notice</p>
                <p className="text-[11px] leading-relaxed mt-0.5 opacity-90">{displayedError}</p>
                {authErrorDetails?.isUnauthorizedDomain && (
                  <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-[11px]">
                    <p className="text-[10px] text-stone-300 font-bold">Copy domain for Firebase Console:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2 py-1 rounded-lg bg-black/50 text-rose-300 font-mono text-[10px] select-all flex-1 truncate">
                        {window.location.hostname}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2500);
                        }}
                        className="px-2.5 py-1 bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedDomain ? 'Copied!' : 'Copy Domain'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="text-stone-400 hover:text-white cursor-pointer p-0.5"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Authentication Box */}
        <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-2xl space-y-3.5">
          <div className="text-center space-y-0.5">
            <h2 className="text-base font-black text-white">
              Sign In to QBite
            </h2>
            <p className="text-[11px] text-[#A1A1A1]">
              Authenticate with your Google account to place and track orders
            </p>
          </div>

          {/* Primary Call to Action: Continue with Google */}
          <button
            onClick={() => handleGoogleSignIn(false)}
            disabled={isSigningIn || isRedirecting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1C1C1C] hover:bg-[#252525] text-white font-black text-sm border border-white/10 hover:border-[#FF6A00]/50 shadow-md flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <>
                <span className="w-4 h-4 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
                <span className="text-stone-300">Connecting to Google...</span>
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
                <span className="tracking-tight text-white font-bold">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Secondary Mobile Friendly Redirect Button */}
          <button
            onClick={() => handleGoogleSignIn(true)}
            disabled={isSigningIn || isRedirecting}
            className="w-full py-1.5 px-3 rounded-xl text-[#737373] hover:text-[#A1A1A1] text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            {isRedirecting ? (
              <>
                <span className="w-3 h-3 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#FF7A00]">Opening Google Gateway...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3" />
                <span>Mobile browser popup issues? Tap for full page</span>
              </>
            )}
          </button>

          {/* Privacy & Trust Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/8 text-[11px] text-[#A1A1A1]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Firebase Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
              <span>Realtime Tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2 border-t border-white/8 relative z-10">
        <p className="text-[11px] text-[#737373]">
          QBite for Sri Venkateswara College of Engineering · Bengaluru
        </p>
      </div>
    </div>
  );
};
