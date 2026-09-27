import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  ArrowRight,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface WelcomePageProps {
  onLoginSuccess: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail, sendEmailMagicLink, verifyEmailLink, quickLoginAs, pendingEmail } = useAuth();

  const [mode, setMode] = useState<'welcome' | 'form' | 'sent'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);
    try {
      await quickLoginAs('student', 'SVCE Student', 'student@svce.ac.in');
      onLoginSuccess();
    } catch {
      // Direct login fallback
      await loginWithEmail('SVCE Student', 'student@svce.ac.in');
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Instantly log in and create user profile in Firestore
      await loginWithEmail(cleanName, cleanEmail);
      setSuccessMsg(`Welcome, ${cleanName}! Redirecting to SVCE Cafe...`);
      
      // Optional background email magic link trigger
      sendEmailMagicLink(cleanEmail, cleanName).catch(() => {});

      // Short delay for satisfying visual feedback before entering
      setTimeout(() => {
        onLoginSuccess();
      }, 400);
    } catch (err: unknown) {
      console.warn('Login notice (applying instant recovery):', err);
      // Failsafe recovery - never block entry
      await quickLoginAs('student', cleanName, cleanEmail);
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await verifyEmailLink(
        email || pendingEmail || 'student@svce.ac.in',
        simulatedLink || window.location.href
      );
      onLoginSuccess();
    } catch {
      await loginWithEmail(name || 'SVCE Student', email || 'student@svce.ac.in');
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (targetRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await quickLoginAs(targetRole);
      onLoginSuccess();
    } catch {
      const email = targetRole === 'admin' ? 'manojreddy8022@gmail.com' : targetRole === 'staff' ? 'staff@svcecafe.in' : 'student@svce.ac.in';
      const defaultName = targetRole === 'admin' ? 'Manoj Reddy' : targetRole === 'staff' ? 'Staff Counter' : 'SVCE Student';
      await loginWithEmail(defaultName, email);
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header Branding */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-stone-900">
            QBite
          </span>
        </div>
        <span className="text-xs uppercase font-bold tracking-wider text-orange-600">
          SVCE Cafe
        </span>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="my-auto py-6 text-center"
          >
            {/* Visual Hero Illustration */}
            <div className="relative w-56 h-56 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-400/20 blur-2xl" />
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
                  alt="Delicious SVCE Food"
                  className="w-full h-full object-cover"
                />
                {/* Floating Token Tag */}
                <div className="absolute bottom-3 left-3 right-3 bg-stone-900/90 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-mono-token font-bold text-xs">
                      #47
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400">Queue Time Saved</p>
                      <p className="text-xs font-bold text-amber-300">18 minutes</p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <h1 className="text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
              QBite
            </h1>
            <p className="text-base font-bold text-orange-600 mt-0.5">
              SVCE Cafe
            </p>
            <p className="text-xl font-bold text-stone-800 mt-2.5">
              Be Smart. Leave the Queue.
            </p>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Order your food before reaching the canteen. Track your token live and pick up with zero waiting.
            </p>

            {/* Action Buttons (Requirement 5) */}
            <div className="mt-7 space-y-3">
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>GET STARTED</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => setMode('form')}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm border border-stone-200 cursor-pointer transition-all"
              >
                LOGIN WITH EMAIL
              </button>
            </div>

            {/* Quick Demo Selector for fast evaluation */}
            <div className="mt-6 pt-5 border-t border-stone-200">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Fast Role Switcher
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleQuickRole('student')}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  onClick={() => handleQuickRole('staff')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer flex items-center gap-1"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Kitchen Staff</span>
                </button>
                <button
                  onClick={() => handleQuickRole('admin')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 cursor-pointer flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="my-auto py-4"
          >
            <div className="mb-5">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                EMAIL AUTHENTICATION
              </span>
              <h2 className="text-2xl font-extrabold text-stone-900 mt-1">
                Enter your details
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                No phone number or password needed. Email only.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CONTINUE</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Bypass Button */}
            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <button
                onClick={handleGetStarted}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Or Continue as Guest Student →
              </button>
            </div>

            <button
              onClick={() => setMode('welcome')}
              className="w-full py-3 text-xs font-bold text-stone-500 hover:text-stone-800 text-center mt-2 cursor-pointer"
            >
              ← Back to welcome screen
            </button>
          </motion.div>
        )}

        {mode === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="my-auto py-6 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-stone-900">
              Check your email
            </h3>

            <p className="text-sm text-stone-600 max-w-xs mx-auto">
              We sent a sign-in link to <br />
              <strong className="text-stone-900 font-semibold">{email}</strong>
            </p>

            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 text-left space-y-2 mt-4">
              <p className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Instant Sign-In</span>
              </p>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                Click below to complete verification and enter the canteen immediately.
              </p>
              <button
                onClick={handleSimulatedVerify}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                {loading ? 'Verifying...' : 'VERIFY & ENTER QBITE →'}
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4 text-xs font-bold">
              <button
                onClick={() => setMode('form')}
                className="text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Change Email
              </button>
              <span className="text-stone-300">·</span>
              <button
                onClick={handleGetStarted}
                className="text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Continue to Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="text-center pt-4 border-t border-stone-200/60">
        <p className="text-[11px] text-stone-400">
          QBite for Sri Venkateswara College of Engineering (SVCE) · Bengaluru
        </p>
      </div>
    </div>
  );
};
