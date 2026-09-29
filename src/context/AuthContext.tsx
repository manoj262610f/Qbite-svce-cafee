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
import { UserProfile, UserRole, AccountStatus } from '../types';
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
  isSuspended: boolean;
  authError: string | null;
  authErrorDetails: AuthErrorInfo | null;
  role: UserRole;
  loginWithGoogle: (useRedirect?: boolean) => Promise<UserProfile | void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  refreshUserProfile: () => Promise<void>;
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

export const DESIGNATED_ADMIN_EMAIL = 'the.team.alpha.ece2026@gmail.com';
export const DESIGNATED_STAFF_EMAIL = 'manojreddy8283@gmail.com';

export const getDesignatedRoleForEmail = (rawEmail: string | null | undefined): UserRole => {
  const email = (rawEmail || '').toLowerCase().trim();
  if (email === DESIGNATED_ADMIN_EMAIL) {
    return 'admin';
  }
  if (email === DESIGNATED_STAFF_EMAIL) {
    return 'staff';
  }
  return 'student';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = safeLocalStorage.getItem('qbite_user_session');
      if (saved) {
        const p: UserProfile = JSON.parse(saved);
        const email = (p.email || '').toLowerCase().trim();
        // Ensure role consistency for designated emails and student default for manojreddy8022
        if (email === DESIGNATED_ADMIN_EMAIL && p.role !== 'admin') {
          p.role = 'admin';
          safeLocalStorage.setItem('qbite_user_session', JSON.stringify(p));
        } else if (email === DESIGNATED_STAFF_EMAIL && p.role !== 'staff' && p.role !== 'admin') {
          p.role = 'staff';
          safeLocalStorage.setItem('qbite_user_session', JSON.stringify(p));
        } else if (email === 'manojreddy8022@gmail.com' && p.role !== 'student') {
          p.role = 'student';
          safeLocalStorage.setItem('qbite_user_session', JSON.stringify(p));
        }
        return p;
      }
      return null;
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

  const isSuspended = userProfile?.accountStatus === 'SUSPENDED';

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

  /**
   * Loads or creates user profile from Firestore.
   * Role is strictly governed by authorized email and Firestore state.
   */
  const handleFirebaseUser = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const uid = fbUser.uid;
    const email = (fbUser.email || '').toLowerCase().trim();
    const name = fbUser.displayName || (email ? email.split('@')[0] : 'SVCE Student');
    const photoURL = fbUser.photoURL || null;

    const designatedRole = getDesignatedRoleForEmail(email);
    let finalRole: UserRole = designatedRole;
    let existingStatus: AccountStatus = 'ACTIVE';
    let existingCreatedAt = new Date().toISOString();

    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        existingStatus = (data.accountStatus as AccountStatus) || 'ACTIVE';
        existingCreatedAt = data.createdAt || existingCreatedAt;

        // Apply strict role assignment:
        if (email === DESIGNATED_ADMIN_EMAIL) {
          finalRole = 'admin';
        } else if (email === DESIGNATED_STAFF_EMAIL) {
          finalRole = data.role === 'admin' ? 'admin' : 'staff';
        } else if (email === 'manojreddy8022@gmail.com') {
          // Explicitly ensure test account is student (clearing any old testing admin role)
          finalRole = 'student';
        } else {
          finalRole = (data.role as UserRole) || designatedRole;
        }

        // Update login timestamp & sync role
        await setDoc(userDocRef, {
          name,
          email,
          role: finalRole,
          photoURL,
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // Create initial record
        const initialDoc = {
          id: uid,
          name,
          email,
          role: designatedRole,
          accountStatus: 'ACTIVE',
          photoURL,
          createdAt: existingCreatedAt,
          lastLoginAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialDoc);
        finalRole = designatedRole;
        existingStatus = 'ACTIVE';
      }
    } catch (err) {
      console.warn('handleFirebaseUser profile sync notice:', err);
    }

    const profile: UserProfile = {
      id: uid,
      name,
      email,
      role: finalRole,
      accountStatus: existingStatus,
      photoURL,
      createdAt: existingCreatedAt,
      lastLoginAt: new Date().toISOString()
    };

    saveSession(profile);
    return profile;
  };

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        const email = (data.email || currentUser.email || '').toLowerCase().trim();
        let enforcedRole: UserRole = (data.role as UserRole) || 'student';

        if (email === DESIGNATED_ADMIN_EMAIL) {
          enforcedRole = 'admin';
        } else if (email === DESIGNATED_STAFF_EMAIL) {
          enforcedRole = data.role === 'admin' ? 'admin' : 'staff';
        } else if (email === 'manojreddy8022@gmail.com') {
          enforcedRole = 'student';
        }

        const updated: UserProfile = {
          id: currentUser.uid,
          name: data.name || currentUser.displayName || 'SVCE Student',
          email: data.email || currentUser.email || '',
          role: enforcedRole,
          accountStatus: (data.accountStatus as AccountStatus) || 'ACTIVE',
          photoURL: data.photoURL || currentUser.photoURL || null,
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || new Date().toISOString()
        };
        saveSession(updated);
      }
    } catch (e) {
      console.warn('Error refreshing profile:', e);
    }
  };

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
      friendlyMessage = 'Pop-up window was blocked by your browser. Tap the mobile redirect button below.';
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

  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    // 1. Check for authenticated payload from bridge in URL hash
    if (typeof window !== 'undefined' && window.location.hash.includes('auth_payload=')) {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const payload = params.get('auth_payload');
        if (payload) {
          const profile = JSON.parse(decodeURIComponent(payload)) as UserProfile;
          if (isMounted && profile?.id) {
            saveSession(profile);
            setLoading(false);
          }
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (err) {
        console.warn('Failed to parse auth payload from hash:', err);
      }
    }

    // 2. Listen for postMessage from popup auth bridge
    const handlePostMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'QBITE_AUTH_SUCCESS' && event.data?.profile?.id) {
        if (isMounted) {
          saveSession(event.data.profile);
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', handlePostMessage);

    // 3. Check for standard redirect result
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
          // If no active Firebase Auth session, clear session
          if (isMounted) {
            saveSession(null);
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

  const loginWithGoogle = async (useRedirect = false): Promise<UserProfile | void> => {
    setLoading(true);
    setAuthError(null);
    setAuthErrorDetails(null);

    const isCurrentHostAuthorized = KNOWN_AUTHORIZED_DOMAINS.includes(window.location.hostname);

    // If host is not in Firebase authorized list (e.g. *.workers.dev):
    // Use the official Authorized Bridge to prevent auth/unauthorized-domain error!
    if (!isCurrentHostAuthorized) {
      const bridgeUrl = `${AUTHORIZED_BRIDGE_BASE}/auth-bridge?origin=${encodeURIComponent(
        window.location.origin
      )}&returnTo=${encodeURIComponent(window.location.href)}`;

      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (useRedirect || isMobileDevice) {
        window.location.href = bridgeUrl;
        return;
      }

      const popup = window.open(
        bridgeUrl,
        'qbite_google_auth',
        'width=500,height=620,menubar=no,toolbar=no,location=no,status=no'
      );

      if (!popup || popup.closed) {
        window.location.href = bridgeUrl;
        return;
      }

      return new Promise<UserProfile>((resolve, reject) => {
        let resolved = false;

        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'QBITE_AUTH_SUCCESS' && event.data?.profile?.id) {
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

    // Direct Firebase Google Auth on authorized domains
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    if (useRedirect) {
      try {
        await signInWithRedirect(auth, provider);
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

  const role: UserRole = userProfile?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isSuspended,
        authError,
        authErrorDetails,
        role,
        loginWithGoogle,
        logout,
        clearAuthError,
        refreshUserProfile
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
