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
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  clearAuthError: () => void;
}

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

  // Handle Redirect Result and onAuthStateChanged on mount
  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    // Check if returning from a signInWithRedirect
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
        if (!isMounted) return;
        console.warn('getRedirectResult notice:', err);
        const { friendlyMessage, details } = parseAuthError(err);
        setAuthError(friendlyMessage);
        setAuthErrorDetails(details);
      });

    // Listen to Firebase Auth state on mount and across sessions
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
          if (isMounted) {
            saveSession(null);
            setLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
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
