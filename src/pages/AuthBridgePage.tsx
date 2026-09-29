import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { QbiteLogo } from '../components/QbiteLogo';

export const AuthBridgePage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to connect your Google account');
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  // Parse parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const targetOrigin = searchParams.get('origin') || '*';
  const returnTo = searchParams.get('returnTo');

  const syncProfile = async (fbUser: any): Promise<UserProfile> => {
    const uid = fbUser.uid;
    const email = fbUser.email || '';
    const name = fbUser.displayName || email.split('@')[0] || 'SVCE Student';
    const photoURL = fbUser.photoURL || null;

    let existingRole: UserRole | undefined;
    let existingCreatedAt: string | undefined;

    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        existingRole = data.role;
        existingCreatedAt = data.createdAt;
      }
    } catch {
      // Safe fallback when unauthenticated
    }

    const normalizedEmail = email.toLowerCase().trim();
    let role: UserRole = 'student';
    if (normalizedEmail === 'the.team.alpha.ece2026@gmail.com' || normalizedEmail === 'manojreddy8022@gmail.com') {
      role = 'admin';
    } else if (normalizedEmail === 'manojreddy8283@gmail.com') {
      role = existingRole === 'admin' ? 'admin' : 'staff';
    } else {
      role = existingRole || 'student';
    }

    const profile: UserProfile = {
      id: uid,
      name,
      email,
      role,
      accountStatus: 'ACTIVE',
      photoURL,
      createdAt: existingCreatedAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
    } catch {
      // Handled silently
    }

    return profile;
  };

  const completeAuth = (profile: UserProfile) => {
    setSuccessUser(profile);
    setStatusMessage('Authenticated successfully! Returning to qBite...');

    // Post to opener window if opened via popup
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          {
            type: 'QBITE_AUTH_SUCCESS',
            profile
          },
          targetOrigin === '*' ? '*' : targetOrigin
        );
      } catch {
        // Ignored
      }
      setTimeout(() => {
        window.close();
      }, 700);
      return;
    }

    // Redirect back if returnTo URL provided (mobile redirect flow)
    if (returnTo) {
      try {
        const url = new URL(returnTo);
        url.hash = `auth_payload=${encodeURIComponent(JSON.stringify(profile))}`;
        window.location.href = url.toString();
        return;
      } catch {
        // Fallback below
      }
    }

    // Fallback: redirect to home
    window.location.href = '/home';
  };

  // If already authenticated on this domain, complete immediately
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await syncProfile(user);
        completeAuth(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    setStatusMessage('Connecting to Google accounts...');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const profile = await syncProfile(result.user);
      completeAuth(profile);
    } catch (err: any) {
      setIsSigningIn(false);
      const msg = err?.message || 'Google sign-in was cancelled or encountered an issue.';
      setError(msg);
      setStatusMessage('Please try again');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-80 h-80 rounded-full bg-[#FF6A00]/10 blur-[100px] pointer-events-none" />

      <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-white/8 shadow-2xl text-center space-y-4 relative z-10">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <QbiteLogo size="lg" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Secure Authentication Gateway
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1">
            Connect with your official Google account
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <p className="flex-1 text-[11px] leading-tight">{error}</p>
          </div>
        )}

        {successUser ? (
          <div className="p-4 rounded-2xl bg-[#0F291E] border border-emerald-500/30 text-emerald-300 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            <p className="font-bold text-sm text-white">
              Welcome, {successUser.name}!
            </p>
            <p className="text-[11px] text-emerald-400">
              Returning you to the cafe...
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1C1C1C] hover:bg-[#252525] text-white font-black text-sm border border-white/10 hover:border-[#FF6A00]/50 shadow-md flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isSigningIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
                  <span className="text-stone-300">Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-[#737373]">
              {statusMessage}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-white/8 flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1A1]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official SVCE Cafe Authentication</span>
        </div>
      </div>
    </div>
  );
};
