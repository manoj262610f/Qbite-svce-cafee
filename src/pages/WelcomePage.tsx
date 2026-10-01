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
  Smartphone,
  ChefHat,
  Shield,
  ArrowRight,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QbiteLogo } from '../components/QbiteLogo';
import { UserRole } from '../types';

interface WelcomePageProps {
  onLoginSuccess: (targetRole?: string) => void;
  onNavigateToDisplay?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onLoginSuccess,
  onNavigateToDisplay
}) => {
  const { loginWithGoogle, loginAsGuest, authError, authErrorDetails, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
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
      const msg = err instanceof Error ? err.message : 'Google sign-in encountered an issue. Please try again or use Student Demo access.';
      setLocalError(msg);
    } finally {
      setIsSigningIn(false);
      setIsRedirecting(false);
    }
  };

  const handleGuestEntry = async (roleToUse: UserRole = 'student') => {
    setIsGuestLoading(true);
    setLocalError(null);
    clearAuthError();
    try {
      const profile = await loginAsGuest(roleToUse);
      onLoginSuccess(profile.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize session';
      setLocalError(msg);
    } finally {
      setIsGuestLoading(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-[#FF6A00] selection:text-black relative overflow-hidden">
      {/* Ambient Orange Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FF6A00]/10 blur-[140px] pointer-events-none -top-32 -right-32" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#FF9D2E]/8 blur-[120px] pointer-events-none -bottom-32 -left-32" />

      {/* Top Header Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-1 relative z-10">
        <QbiteLogo size="md" />

        {onNavigateToDisplay && (
          <button
            onClick={onNavigateToDisplay}
            title="Open Live Canteen TV Display"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 text-xs font-bold text-stone-300 hover:text-white cursor-pointer shadow-md transition-colors"
          >
            <Monitor className="w-4 h-4 text-[#FF6A00]" />
            <span className="hidden sm:inline">Live TV Display</span>
            <span className="sm:hidden">TV Display</span>
          </button>
        )}
      </header>

      {/* Main Content Area (2-column layout on desktop, clean single-column on mobile) */}
      <main className="max-w-6xl w-full mx-auto my-auto py-6 sm:py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Hero Revelation & Features */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            <div className="relative inline-block mx-auto lg:mx-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-[#0D0D0D] border border-white/20 shadow-2xl glow-orange-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/icons/qbite-icon-512.png"
                  alt="QBite – SVCE Cafe"
                  className="w-full h-full object-contain rounded-full select-none"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>
              {/* Live Status Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 px-3.5 py-1 rounded-full bg-[#181818] border border-[#FF6A00]/40 text-[#FF7A00] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>SVCE Campus Dining</span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                QBite <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E]">Cafe</span>
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#A1A1A1] font-bold mt-1">
                Sri Venkateswara College of Engineering
              </p>
              <p className="text-base sm:text-lg font-bold text-[#FF7A00] mt-3">
                Order Smart. Skip the Queue.
              </p>
              <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-lg mx-auto lg:mx-0 leading-relaxed mt-2">
                Order hot meals, breakfast, and snacks from anywhere on campus. Watch your live token update on your phone and collect freshly prepared food with zero queueing.
              </p>
            </div>

            {/* Feature Highlights on Desktop */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-3 text-left">
              <div className="bg-[#141414] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[#FF6A00]">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Live Tokens</span>
                </div>
                <p className="text-[11px] text-[#A1A1A1]">Real-time kitchen order tracking</p>
              </div>

              <div className="bg-[#141414] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Zero Queues</span>
                </div>
                <p className="text-[11px] text-[#A1A1A1]">Instant counter food collection</p>
              </div>

              <div className="bg-[#141414] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Utensils className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Campus Menu</span>
                </div>
                <p className="text-[11px] text-[#A1A1A1]">Fresh breakfast & hot meals</p>
              </div>
            </div>
          </div>

          {/* Right Column: Google Authentication & Quick Student Entry */}
          <div className="lg:col-span-5 max-w-md w-full mx-auto">
            {/* Error Notification Alert */}
            <AnimatePresence>
              {displayedError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 p-4 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs shadow-md flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-xs text-white">Sign-In Notice</p>
                    <p className="text-xs leading-relaxed mt-0.5 opacity-90">{displayedError}</p>
                    {authErrorDetails?.isUnauthorizedDomain && (
                      <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-xs">
                        <p className="text-[11px] text-stone-300 font-bold">Copy domain for Firebase Console:</p>
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
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Authentication Container */}
            <div className="bg-[#141414] rounded-3xl p-6 sm:p-7 border border-white/8 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Enter SVCE Cafe
                </h2>
                <p className="text-xs text-[#A1A1A1]">
                  Sign in with Google or explore directly as a student
                </p>
              </div>

              {/* Primary Call to Action: Continue with Google */}
              <button
                onClick={() => handleGoogleSignIn(false)}
                disabled={isSigningIn || isRedirecting || isGuestLoading}
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

              {/* Mobile Friendly Redirect Link */}
              <button
                onClick={() => handleGoogleSignIn(true)}
                disabled={isSigningIn || isRedirecting || isGuestLoading}
                className="w-full py-1 text-[#737373] hover:text-[#A1A1A1] text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isRedirecting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#FF7A00]">Redirecting to Google...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile browser popup blocked? Tap for full page</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <span className="relative px-3 bg-[#141414] text-[10px] uppercase font-black tracking-wider text-stone-500">
                  Or One-Tap Instant Access
                </span>
              </div>

              {/* Instant Student Access Button */}
              <button
                onClick={() => handleGuestEntry('student')}
                disabled={isSigningIn || isRedirecting || isGuestLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] hover:from-[#FF7A00] hover:to-[#FFAE47] text-black font-black text-xs sm:text-sm shadow-xl glow-orange-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isGuestLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Opening Cafe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>ENTER AS STUDENT (INSTANT ACCESS)</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Staff / Admin Quick Review Switcher */}
              <div className="pt-2 border-t border-white/8">
                <p className="text-[10px] text-stone-400 font-bold text-center mb-2">
                  Staff & Administration Review Mode:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGuestEntry('staff')}
                    disabled={isSigningIn || isRedirecting || isGuestLoading}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-[11px] font-bold text-stone-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Kitchen Staff</span>
                  </button>
                  <button
                    onClick={() => handleGuestEntry('admin')}
                    disabled={isSigningIn || isRedirecting || isGuestLoading}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-[11px] font-bold text-purple-300 hover:text-purple-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Canteen Admin</span>
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/8 text-[10px] text-[#A1A1A1]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Secure Session</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                  <span>Realtime Queue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto text-center pt-4 border-t border-white/8 relative z-10">
        <p className="text-xs text-[#737373]">
          QBite · Sri Venkateswara College of Engineering · Bengaluru, Karnataka
        </p>
      </footer>
    </div>
  );
};
