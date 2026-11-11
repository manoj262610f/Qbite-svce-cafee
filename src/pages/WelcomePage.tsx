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
  ExternalLink,
  Copy,
  Check,
  Utensils,
  CalendarClock,
  MapPin,
  HelpCircle
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
  const [copiedWildcard, setCopiedWildcard] = useState(false);

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
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-[#FF6B00] selection:text-black relative">
      {/* Top Header Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-1 relative z-10">
        <QbiteLogo size="md" />

        {onNavigateToDisplay && (
          <button
            onClick={onNavigateToDisplay}
            title="Open Live Canteen TV Display"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#151515] hover:bg-stone-800 border border-white/10 text-xs font-bold text-stone-300 hover:text-white cursor-pointer shadow-md transition-colors"
          >
            <Monitor className="w-4 h-4 text-[#FF6B00]" />
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
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-[#151515] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src="/icons/qbite-icon-512.png"
                  alt="QBite – SVCE Cafe"
                  className="w-full h-full object-contain rounded-full select-none"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>
              {/* Live Status Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 px-3.5 py-1 rounded-full bg-[#151515] border border-[#FF6B00]/40 text-[#FF6B00] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>SVCE Campus Dining</span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                QBite – SVCE Cafe <br className="hidden sm:inline" />
                <span className="text-[#FF6B00]">Online Food Ordering</span>
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#D9D9D9] font-bold mt-2">
                Sri Venkateshwara College of Engineering · Campus Canteen
              </p>
              <p className="text-base sm:text-lg font-bold text-[#FF6B00] mt-2">
                Be Smart. Leave the Queue.
              </p>
              <p className="text-xs sm:text-sm text-[#D9D9D9] max-w-lg mx-auto lg:mx-0 leading-relaxed mt-2">
                The official online food ordering platform for SVCE students, faculty, and campus staff. Browse hot meals, schedule orders in advance, and collect freshly prepared food with live digital token tracking.
              </p>
            </div>

            {/* Feature Highlights on Desktop */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-3 text-left">
              <div className="bg-[#151515] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[#FF6B00]">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Live Tokens</span>
                </div>
                <p className="text-[11px] text-[#D9D9D9]">Real-time kitchen order tracking</p>
              </div>

              <div className="bg-[#151515] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Zero Queues</span>
                </div>
                <p className="text-[11px] text-[#D9D9D9]">Instant counter food collection</p>
              </div>

              <div className="bg-[#151515] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Utensils className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase">Campus Menu</span>
                </div>
                <p className="text-[11px] text-[#D9D9D9]">Fresh breakfast & hot meals</p>
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
                  className="mb-4 p-4 rounded-2xl bg-[#1C1111] border border-rose-500/40 text-rose-300 text-xs shadow-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-black text-xs text-white">Sign-In Notice</p>
                      <p className="text-xs leading-relaxed mt-0.5 text-rose-200/90">{displayedError}</p>
                    </div>

                    {(authErrorDetails?.isUnauthorizedDomain || displayedError.toLowerCase().includes('authorized domain')) && (
                      <div className="pt-2 border-t border-rose-500/20 space-y-2.5">
                        <div>
                          <p className="text-[11px] text-stone-200 font-bold">1. Recommended: Authorize all Cloudflare workers</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="px-2.5 py-1 rounded-lg bg-black/70 text-emerald-300 font-mono text-[11px] select-all flex-1 border border-emerald-500/30">
                              workers.dev
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('workers.dev');
                                setCopiedWildcard(true);
                                setTimeout(() => setCopiedWildcard(false), 2500);
                              }}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {copiedWildcard ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedWildcard ? 'Copied!' : 'Copy workers.dev'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] text-stone-300 font-bold">2. Or authorize exact preview domain:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="px-2.5 py-1 rounded-lg bg-black/70 text-rose-300 font-mono text-[10px] select-all flex-1 truncate border border-rose-500/30">
                              {window.location.hostname}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.hostname);
                                setCopiedDomain(true);
                                setTimeout(() => setCopiedDomain(false), 2500);
                              }}
                              className="px-2.5 py-1 bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="pt-1">
                          <a
                            href="https://console.firebase.google.com/project/hypnic-factor-nlcf1/authentication/settings"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black text-[11px] font-black transition-all cursor-pointer shadow-md"
                          >
                            <span>Open Firebase Console Settings</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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
            <div className="bg-[#151515] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-[10px] font-black uppercase tracking-wider">
                  <span>Official Campus Portal</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Welcome to QBite
                </h2>
                <p className="text-xs text-[#D9D9D9] max-w-xs mx-auto">
                  Sign in with your Google account to order meals, schedule pickup, and track live tokens.
                </p>
              </div>

              {/* Primary Call to Action: Continue with Google */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => handleGoogleSignIn(false)}
                  disabled={isSigningIn || isRedirecting}
                  className="w-full py-4 px-5 rounded-2xl bg-[#000000] hover:bg-[#1C1C1C] text-white font-black text-sm sm:text-base border-2 border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_25px_rgba(255,107,0,0.35)] flex items-center justify-center gap-3.5 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {isSigningIn ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                      <span className="text-stone-300">Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google 'G' Icon */}
                      <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
                      <span className="tracking-tight text-white font-black">
                        Continue with Google
                      </span>
                    </>
                  )}
                </button>

                {/* Mobile Friendly Redirect Link */}
                <button
                  onClick={() => handleGoogleSignIn(true)}
                  disabled={isSigningIn || isRedirecting}
                  className="w-full py-2 text-[#D9D9D9] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isRedirecting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[#FF6B00] font-bold">Redirecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Mobile popup blocked? Tap for full page sign-in</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust & Feature Badges */}
              <div className="pt-3 border-t border-white/8 space-y-2 text-[11px] text-[#D9D9D9]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Secure Google Authentication · Role-verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>Live order token tracking on your phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant counter pickup · Leave the queue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Feature Showcase & Informational Section */}
        <section className="pt-12 sm:pt-16 border-t border-white/10 space-y-8 mt-12" aria-label="About QBite SVCE Cafe Platform">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#FF6B00]/40 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
              <span>Campus Canteen Innovation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Smart Canteen Food Ordering for SVCE Students
            </h2>
            <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed">
              QBite is built specifically for Sri Venkateshwara College of Engineering (SVCE) to make dining fast, seamless, and queue-free. From instant breakfast orders to scheduled lunch pickups, every order is coordinated with live digital kitchen tokens.
            </p>
          </div>

          {/* 4 Feature Pillars with semantic H3 headings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <article className="bg-[#151515] p-5 rounded-3xl border border-white/10 space-y-2.5 shadow-md hover:border-[#FF6B00]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#000000] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Online Food Ordering for SVCE Students</h3>
              <p className="text-xs text-[#D9D9D9] leading-relaxed">
                Browse fresh South Indian breakfast (idli, vada, masala dosa, poori), hot lunch meals, North Indian combos, snacks, and beverages with transparent student-friendly prices.
              </p>
            </article>

            <article className="bg-[#151515] p-5 rounded-3xl border border-white/10 space-y-2.5 shadow-md hover:border-[#FF6B00]/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#000000] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                <CalendarClock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Schedule Your Order in Advance</h3>
              <p className="text-xs text-[#D9D9D9] leading-relaxed">
                Reserve meal pickup ahead of class intervals or college lunch breaks. Select a future time slot during canteen hours so your food is fresh and waiting without standing in lines.
              </p>
            </article>

            <article className="bg-[#151515] p-5 rounded-3xl border border-white/10 space-y-2.5 shadow-md hover:border-emerald-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#000000] border border-white/10 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Live Kitchen Tokens & Real-Time Queue</h3>
              <p className="text-xs text-[#D9D9D9] leading-relaxed">
                Receive a live digital token number on your smartphone. Watch status update in real-time ('Pending' &rarr; 'Preparing' &rarr; 'Ready') synced with the canteen counter pickup board.
              </p>
            </article>

            <article className="bg-[#151515] p-5 rounded-3xl border border-white/10 space-y-2.5 shadow-md hover:border-amber-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#000000] border border-white/10 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Kitchen Management & Fast Pickup</h3>
              <p className="text-xs text-[#D9D9D9] leading-relaxed">
                The dedicated kitchen staff dashboard sequences incoming orders for optimal preparation, ensuring rapid handoff at the counter and eliminating crowded canteen rush.
              </p>
            </article>
          </div>

          {/* Campus Canteen Details & FAQ */}
          <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#FF6B00]">
                <HelpCircle className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider">Campus Dining Guide</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">Frequently Asked Questions · SVCE Canteen</h3>
              <p className="text-xs text-[#D9D9D9] mt-0.5">Everything SVCE students and faculty need to know about online canteen ordering</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#D9D9D9] leading-relaxed">
              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm">How do SVCE students order food on QBite?</h4>
                <p>Simply sign in with your Google account, browse the SVCE canteen menu, select your preferred dishes, and choose between 'Order Now' for earliest preparation or 'Schedule Your Order' for a future pickup slot.</p>
              </div>

              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm">What are the SVCE Cafe operating hours?</h4>
                <p>The SVCE canteen operates Monday through Saturday from 7:30 AM to 5:30 PM India Standard Time (IST), serving morning breakfast, afternoon lunch combos, evening snacks, and fresh hot tea/coffee.</p>
              </div>

              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm">How does the scheduled orders feature work?</h4>
                <p>Students can pick a pickup date and time slot within canteen hours with at least 15 minutes of advance notice. The kitchen prepares your food right before your scheduled slot so it remains hot and fresh.</p>
              </div>

              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm">Where is the SVCE Cafe campus location?</h4>
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span>Sri Venkateshwara College of Engineering, Vidyanagar, Kempegowda International Airport Road, Bengaluru, Karnataka 562157.</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto text-center pt-4 border-t border-white/8 relative z-10">
        <p className="text-xs text-[#D9D9D9]/70">
          QBite · Sri Venkateswara College of Engineering · Bengaluru, Karnataka
        </p>
      </footer>
    </div>
  );
};
