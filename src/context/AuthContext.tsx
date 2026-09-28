import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { safeLocalStorage } from '../services/safeStorage';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain: string;
  isUnauthorizedDomain: boolean;
  isOperationNotAllowed: boolean;
  isPopupBlocked: boolean;
  firebaseConsoleUrl: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  authErrorDetails: AuthErrorInfo | null;
  role: UserRole;
  loginWithGoogle: (useRedirect?: boolean) => Promise<UserProfile | void>;
  loginWithCampusGuest: (guestName?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  clearAuthError: () => void;
}

const KNOWN_AUTHORIZED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'hypnic-factor-nlcf1.firebaseapp.com',
  'hypnic-factor-nlcf1.web.app',
  'ais-dev-iqrxqckovfpyhkq2qvz44r-316718521676.asia-southeast1.run.app',
  'ais-shared-iqrxqckovfpyhkq2qvz44r-316718521676.asia-southeast1.run.app',
  'ais-pre-iqrxqckovfpyhkq2qvz44r-316718521676.asia-southeast1.run.app',
  'ais-mob-iqrxqckovfpyhkq2qvz44r-316718521676.asia-southeast1.run.app',
  'qbite-svce-cafe-89298859770.asia-southeast1.run.app',
  'qbite-svce-cafe.ai.studio'
];

const AUTHORIZED_BRIDGE_BASE = 'https://ais-pre-iqrxqckovfpyhkq2qvz44r-316718521676.asia-southeast1.run.app';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try restoring initial cached session for instant perceived load
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = safeLocalStorage.getItem('qbite_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = safeLocalStorage.getItem('qbite_user_session');
      if (saved) {
        const p: UserProfile = JSON.parse(saved);
        return {
          uid: p.id,
          email: p.email,
          displayName: p.name,
          photoURL: p.photoURL || null
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorDetails, setAuthErrorDetails] = useState<AuthErrorInfo | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
    setAuthErrorDetails(null);
  };

  // Sync state & local storage
  const saveSession = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      const authUser: AuthUser = {
        uid: profile.id,
        email: profile.email,
        displayName: profile.name,
        photoURL: profile.photoURL || null
      };
      setCurrentUser(authUser);
      safeLocalStorage.setItem('qbite_user_session', JSON.stringify(profile));
    } else {
      setCurrentUser(null);
      safeLocalStorage.removeItem('qbite_user_session');
    }
  };

  // Sync profile to Firestore
  const syncProfileToFirestore = async (profile: UserProfile) => {
    try {
      const userDocRef = doc(db, 'users', profile.id);
      await setDoc(userDocRef, profile, { merge: true });
    } catch (err) {
      console.warn('Firestore user profile sync warning:', err);
    }
  };

  // Process a Firebase User into a local UserProfile
  const handleFirebaseUser = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const uid = fbUser.uid;
    const email = fbUser.email || '';
    const name = fbUser.displayName || (email ? email.split('@')[0] : 'SVCE Student');
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
    } catch (err) {
      console.warn('handleFirebaseUser: could not fetch existing profile:', err);
    }

    const isAdminEmail = email.toLowerCase() === 'manojreddy8022@gmail.com';
    const assignedRole: UserRole = isAdminEmail
      ? 'admin'
      : (existingRole || userProfile?.role || 'student');

    const profile: UserProfile = {
      id: uid,
      name,
      email,
      role: assignedRole,
      photoURL,
      createdAt: existingCreatedAt || userProfile?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    saveSession(profile);
    await syncProfileToFirestore(profile);
    return profile;
  };

  // Parse errors into friendly messages and details
  const parseAuthError = (error: any): { friendlyMessage: string; details: AuthErrorInfo } => {
    const code = error?.code || '';
    const rawMessage = error?.message || '';
    const hostname = window.location.hostname || 'localhost';
    const projectId = auth.app.options.projectId || 'hypnic-factor-nlcf1';

    const isUnauthorizedDomain =
      code === 'auth/unauthorized-domain' ||
      rawMessage.toLowerCase().includes('unauthorized domain') ||
      rawMessage.toLowerCase().includes('unauthorized-domain') ||
      rawMessage.toLowerCase().includes('authorized domain');

    const isOperationNotAllowed =
      code === 'auth/operation-not-allowed' ||
      rawMessage.toLowerCase().includes('operation-not-allowed');

    const isPopupBlocked =
      code === 'auth/popup-blocked' ||
      rawMessage.toLowerCase().includes('popup-blocked');

    let friendlyMessage = 'Google Sign-In failed. Please try again.';

    if (isUnauthorizedDomain) {
      friendlyMessage = `Domain "${hostname}" is not authorized in Firebase. Add it to Firebase Console > Authentication > Settings > Authorized domains.`;
    } else if (isOperationNotAllowed) {
      friendlyMessage = 'Google Sign-In provider is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method.';
    } else if (code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Google sign-in was cancelled before completion.';
    } else if (code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Sign-in was interrupted. Please click Continue with Google again.';
    } else if (isPopupBlocked) {
      friendlyMessage = 'Pop-up window was blocked by your browser. Please allow pop-ups or use Redirect Sign-In.';
    } else if (code === 'auth/network-request-failed') {
      friendlyMessage = 'Network error. Please check your internet connection and try again.';
    } else if (rawMessage) {
      friendlyMessage = rawMessage;
    }

    const consoleUrl = isOperationNotAllowed
      ? `https://console.firebase.google.com/project/${projectId}/authentication/providers`
      : `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

    const details: AuthErrorInfo = {
      code,
      message: friendlyMessage,
      domain: hostname,
      isUnauthorizedDomain,
      isOperationNotAllowed,
      isPopupBlocked,
      firebaseConsoleUrl: consoleUrl
    };

    return { friendlyMessage, details };
  };

  // Handle Redirect Result, PostMessage, Hash Payloads, and onAuthStateChanged on mount
  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    // 1. Check for auth payload from redirect bridge in URL hash
    if (typeof window !== 'undefined' && window.location.hash.includes('auth_payload=')) {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const payload = params.get('auth_payload');
        if (payload) {
          const profile = JSON.parse(decodeURIComponent(payload)) as UserProfile;
          if (isMounted) {
            saveSession(profile);
            setLoading(false);
          }
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse auth payload from hash:', err);
      }
    }

    // 2. Listen for postMessage from popup auth bridge
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data?.type === 'QBITE_AUTH_SUCCESS' && event.data?.profile) {
        if (isMounted) {
          saveSession(event.data.profile);
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', handlePostMessage);

    // 3. Check if returning from a standard Firebase signInWithRedirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted) return;
        if (result && result.user) {
          const profile = await handleFirebaseUser(result.user);
          if (isMounted) {
            saveSession(profile);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        // Only log notice; never set authError on initial mount so visitors never see an error banner on opening
        console.warn('getRedirectResult notice:', err);
      });

    // 4. Listen to Firebase Auth state on mount and across sessions
    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (!isMounted) return;

        if (fbUser) {
          try {
            const profile = await handleFirebaseUser(fbUser);
            if (isMounted) {
              saveSession(profile);
              setLoading(false);
            }
          } catch (err) {
            console.error('Error handling user auth change:', err);
            if (isMounted) setLoading(false);
          }
        } else {
          // If we already have a cached session (e.g. from bridge or local storage), don't wipe it unless explicit logout
          if (isMounted) {
            setLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
        window.removeEventListener('message', handlePostMessage);
      };
    } catch (err) {
      console.error('Firebase Auth listener initialization error:', err);
      setLoading(false);
    }
  }, []);

  // Google Sign-In with Firebase Authentication
  const loginWithGoogle = async (useRedirect = false): Promise<UserProfile | void> => {
    setLoading(true);
    setAuthError(null);
    setAuthErrorDetails(null);

    const isCurrentHostAuthorized = KNOWN_AUTHORIZED_DOMAINS.includes(window.location.hostname);

    // If current domain is NOT in Firebase's authorized domains (e.g. *.workers.dev):
    // Use the official Authorized Bridge to prevent auth/unauthorized-domain error!
    if (!isCurrentHostAuthorized) {
      const bridgeUrl = `${AUTHORIZED_BRIDGE_BASE}/auth-bridge?origin=${encodeURIComponent(
        window.location.origin
      )}&returnTo=${encodeURIComponent(window.location.href)}`;

      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (useRedirect || isMobileDevice) {
        // On mobile or when redirect requested, navigate directly to bridge
        window.location.href = bridgeUrl;
        return;
      }

      // On desktop, open popup bridge
      const popup = window.open(
        bridgeUrl,
        'qbite_google_auth',
        'width=500,height=620,menubar=no,toolbar=no,location=no,status=no'
      );

      if (!popup || popup.closed) {
        // Popups blocked by browser -> fallback to redirect
        window.location.href = bridgeUrl;
        return;
      }

      // Wait for postMessage or popup close
      return new Promise<UserProfile>((resolve, reject) => {
        let resolved = false;

        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'QBITE_AUTH_SUCCESS' && event.data?.profile) {
            resolved = true;
            window.removeEventListener('message', messageHandler);
            saveSession(event.data.profile);
            setLoading(false);
            resolve(event.data.profile);
          }
        };

        window.addEventListener('message', messageHandler);

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setTimeout(() => {
              if (!resolved) {
                window.removeEventListener('message', messageHandler);
                setLoading(false);
                setAuthError('Sign-in window was closed. Please try Continue with Google again.');
                reject(new Error('Sign-in window was closed'));
              }
            }, 600);
          }
        }, 700);
      });
    }

    // Direct Firebase Google Auth on authorized domains:
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    if (useRedirect) {
      try {
        await signInWithRedirect(auth, provider);
        // Page will redirect to Google
        return;
      } catch (error: any) {
        setLoading(false);
        const { friendlyMessage, details } = parseAuthError(error);
        setAuthError(friendlyMessage);
        setAuthErrorDetails(details);
        throw new Error(friendlyMessage);
      }
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await handleFirebaseUser(result.user);
      setLoading(false);
      return profile;
    } catch (error: any) {
      setLoading(false);
      const { friendlyMessage, details } = parseAuthError(error);
      setAuthError(friendlyMessage);
      setAuthErrorDetails(details);
      throw new Error(friendlyMessage);
    }
  };

  // Instant Campus Student Access (ensures no student is ever locked out of ordering food)
  const loginWithCampusGuest = async (guestName = 'SVCE Student'): Promise<UserProfile> => {
    setLoading(true);
    setAuthError(null);
    setAuthErrorDetails(null);

    const guestId = `svce_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const guestEmail = `student_${guestId.slice(-4)}@svce.ac.in`;

    const profile: UserProfile = {
      id: guestId,
      name: guestName,
      email: guestEmail,
      role: 'student',
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    saveSession(profile);
    await syncProfileToFirestore(profile);
    setLoading(false);
    return profile;
  };

  // Sign out
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    } finally {
      saveSession(null);
      setLoading(false);
    }
  };

  // Switch role (for testing or authorized roles)
  const switchRole = async (targetRole: UserRole): Promise<void> => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      role: targetRole
    };
    saveSession(updated);
    try {
      const userDocRef = doc(db, 'users', userProfile.id);
      await setDoc(userDocRef, { role: targetRole }, { merge: true });
    } catch (err) {
      console.warn('switchRole Firestore sync notice:', err);
    }
  };

  const role: UserRole = userProfile?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        authErrorDetails,
        role,
        loginWithGoogle,
        loginWithCampusGuest,
        logout,
        switchRole,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
