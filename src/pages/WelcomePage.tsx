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
  X,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  RefreshCw
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
  const { loginWithGoogle, authError, authErrorDetails, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

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
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setLocalError(msg);
    } finally {
      setIsSigningIn(false);
      setIsRedirecting(false);
    }
  };

  const handleCopyDomain = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentDomain);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentDomain;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Could not copy domain:', e);
    }
  };

  const displayedError = localError || authError;
  const isUnauthorized = authErrorDetails?.isUnauthorizedDomain ||
    (displayedError && displayedError.toLowerCase().includes('authorized domain'));

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
      <div className="my-auto py-3">
        {/* Visual Hero Illustration */}
        <div className="relative w-52 h-52 mx-auto mb-4">
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
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3 text-orange-600" />
            <span>Official SVCE Food Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight leading-tight">
            Be Smart. Leave the Queue.
          </h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed pt-1">
            Order your food before reaching the canteen. Track your token live and pick up with zero waiting.
          </p>
        </div>

        {/* Error Notification Alert & Domain Authorization Wizard */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-4 p-4 rounded-2xl border text-xs shadow-xs ${
                isUnauthorized
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isUnauthorized ? 'text-amber-600' : 'text-rose-600'
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`font-extrabold text-[12px] leading-tight ${
                      isUnauthorized ? 'text-amber-900' : 'text-rose-900'
                    }`}
                  >
                    {isUnauthorized ? 'Firebase Domain Authorization Needed' : 'Sign-In Notice'}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-1 opacity-90">
                    {displayedError}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLocalError(null);
                    clearAuthError();
                  }}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step-by-step domain authorization guidance */}
              {isUnauthorized && (
                <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2.5">
                  <p className="text-[11px] font-bold text-amber-900">
                    Quick 1-Minute Fix:
                  </p>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Your Hosting Domain:
                      </span>
                      <code className="text-[11px] font-mono font-bold text-stone-900 truncate block">
                        {currentDomain}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyDomain}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-950 font-medium pl-1">
                    <li>Open Firebase Console Settings below</li>
                    <li>Scroll down to <strong>Authorized domains</strong></li>
                    <li>Click <strong>Add domain</strong> and paste your domain</li>
                    <li>Click <strong>Save</strong> and tap Retry below!</li>
                  </ol>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={authErrorDetails?.firebaseConsoleUrl || 'https://console.firebase.google.com/project/hypnic-factor-nlcf1/authentication/settings'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-center font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open Firebase Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleGoogleSignIn(false)}
                      disabled={isSigningIn}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>
              )}
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
            onClick={() => handleGoogleSignIn(false)}
            disabled={isSigningIn || isRedirecting}
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

          {/* Secondary Mobile Friendly Redirect Button */}
          <button
            onClick={() => handleGoogleSignIn(true)}
            disabled={isSigningIn || isRedirecting}
            className="w-full py-2 px-3 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            title="Alternative sign-in method for mobile browsers where pop-ups may be blocked"
          >
            {isRedirecting ? (
              <>
                <span className="w-3 h-3 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile browser having pop-up issues? Tap here</span>
              </>
            )}
          </button>

          {/* Privacy & Trust Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
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
      <div className="text-center pt-2 border-t border-stone-200/60 space-y-1">
        <p className="text-[11px] text-stone-400">
          QBite for Sri Venkateswara College of Engineering (SVCE) · Bengaluru
        </p>
        {currentDomain && currentDomain !== 'localhost' && (
          <p className="text-[10px] text-stone-400/80 font-mono">
            Host: {currentDomain}
          </p>
        )}
      </div>
    </div>
  );
};
