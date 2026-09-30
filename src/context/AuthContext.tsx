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

export type AuthState = 'AUTH_LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

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
  authLoading: boolean;
  profileLoading: boolean;
  authState: AuthState;
  isSuspended: boolean;
  authError: string | null;
  authErrorDetails: AuthErrorInfo | null;
  role: UserRole;
  loginWithGoogle: (useRedirect?: boolean) => Promise<UserProfile | void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  refreshUserProfile: () => Promise<void>;
}

export const DESIGNATED_ADMIN_EMAILS = [
  'the.team.alpha.ece2026@gmail.com',
  'manojreddy8022@gmail.com'
];
export const DESIGNATED_STAFF_EMAILS = [
  'manojreddy8283@gmail.com'
];

export const getDesignatedRoleForEmail = (rawEmail: string | null | undefined): UserRole => {
  const email = (rawEmail || '').toLowerCase().trim();
  if (DESIGNATED_ADMIN_EMAILS.includes(email)) {
    return 'admin';
  }
  if (DESIGNATED_STAFF_EMAILS.includes(email)) {
    return 'staff';
  }
  return 'student';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Core loading states: authLoading remains true until Firebase onAuthStateChanged returns
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

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
      safeLocalStorage.setItem('qbite_user_session', JSON.stringify(profile));
    } else {
      safeLocalStorage.removeItem('qbite_user_session');
    }
  };

  /**
   * Loads or creates user profile in Firestore at users/{uid}.
   * UID is strictly used as the document ID.
   * Role is authoritative based on Firestore and designated administration accounts.
   */
  const handleFirebaseUser = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const uid = fbUser.uid;
    const email = (fbUser.email || '').toLowerCase().trim();
    const name = fbUser.displayName || (email ? email.split('@')[0] : 'SVCE Student');
    const photoURL = fbUser.photoURL || null;

    console.log('[AUTH] Loading user profile for UID:', uid, 'Email:', email);

    const designatedRole = getDesignatedRoleForEmail(email);
    let finalRole: UserRole = designatedRole;
    let existingStatus: AccountStatus = 'ACTIVE';
    let existingCreatedAt = new Date().toISOString();

    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        console.log('[AUTH] Profile found in Firestore');
        const data = userSnap.data();
        existingStatus = (data.accountStatus as AccountStatus) || 'ACTIVE';
        existingCreatedAt = data.createdAt || existingCreatedAt;

        // Apply strict role assignment:
        if (DESIGNATED_ADMIN_EMAILS.includes(email)) {
          finalRole = 'admin';
        } else if (DESIGNATED_STAFF_EMAILS.includes(email)) {
          finalRole = data.role === 'admin' ? 'admin' : 'staff';
        } else {
          finalRole = (data.role as UserRole) || designatedRole;
        }

        // Update login timestamp & sync profile
        await setDoc(
          userDocRef,
          {
            name,
            email,
            role: finalRole,
            photoURL,
            lastLoginAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else {
        console.log('[AUTH] New user! Creating Firestore profile with role:', designatedRole);
        // Create initial record: Requirement 8
        const initialDoc = {
          id: uid,
          uid,
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
      console.warn('[AUTH] Firestore user profile sync note (continuing with auth):', err);
      // Requirement 17: Failure to read Firestore profile must not log the user out
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

    console.log('[AUTH] Profile loaded. Role:', finalRole);
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

        if (DESIGNATED_ADMIN_EMAILS.includes(email)) {
          enforcedRole = 'admin';
        } else if (DESIGNATED_STAFF_EMAILS.includes(email)) {
          enforcedRole = data.role === 'admin' ? 'admin' : 'staff';
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
    } catch (err) {
      console.warn('[AUTH] refreshUserProfile note:', err);
    }
  };

  const parseAuthError = (error: any): { friendlyMessage: string; details: AuthErrorInfo } => {
    const code = error?.code || '';
    const rawMessage = error?.message || '';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
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
      friendlyMessage = 'Pop-up window was blocked by your browser. Please allow popups or tap the mobile redirect button below.';
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

  // Subscribe to Firebase Auth state on mount exactly once
  useEffect(() => {
    console.log('[AUTH] Loading authentication state...');
    let isMounted = true;

    // Check for redirect result if signInWithRedirect was used
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted) return;
        if (result && result.user) {
          console.log('[AUTH] Redirect sign-in result received for UID:', result.user.uid);
          await handleFirebaseUser(result.user);
        }
      })
      .catch((err) => {
        console.warn('[AUTH] getRedirectResult notice:', err);
      });

    // onAuthStateChanged is the authoritative source of truth for auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!isMounted) return;

      if (fbUser) {
        console.log('[AUTH] User authenticated: UID', fbUser.uid, fbUser.email);
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL || null
        };
        setCurrentUser(authUser);
        setAuthLoading(false);
        setProfileLoading(true);

        try {
          const profile = await handleFirebaseUser(fbUser);
          if (isMounted) {
            saveSession(profile);
          }
        } catch (err) {
          console.warn('[AUTH] User profile loading fallback:', err);
        } finally {
          if (isMounted) {
            setProfileLoading(false);
          }
        }
      } else {
        console.log('[AUTH] No user session found (UNAUTHENTICATED)');
        if (isMounted) {
          setCurrentUser(null);
          setUserProfile(null);
          safeLocalStorage.removeItem('qbite_user_session');
          setAuthLoading(false);
          setProfileLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (useRedirect = false): Promise<UserProfile | void> => {
    setAuthError(null);
    setAuthErrorDetails(null);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    if (useRedirect) {
      console.log('[AUTH] Initiating signInWithRedirect...');
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (error: any) {
        console.error('[AUTH] signInWithRedirect error:', error);
        const { friendlyMessage, details } = parseAuthError(error);
        setAuthError(friendlyMessage);
        setAuthErrorDetails(details);
        throw new Error(friendlyMessage);
      }
    }

    console.log('[AUTH] Initiating signInWithPopup...');
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('[AUTH] Google sign-in successful for UID:', result.user.uid);
      const profile = await handleFirebaseUser(result.user);
      return profile;
    } catch (error: any) {
      console.error('[AUTH] Google sign-in error:', error);
      const { friendlyMessage, details } = parseAuthError(error);
      setAuthError(friendlyMessage);
      setAuthErrorDetails(details);
      throw new Error(friendlyMessage);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AUTH] Logging out user...');
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[AUTH] signOut error:', err);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      safeLocalStorage.removeItem('qbite_user_session');
      console.log('[AUTH] User logged out successfully');
    }
  };

  const loading = authLoading || profileLoading;
  const authState: AuthState = authLoading
    ? 'AUTH_LOADING'
    : currentUser
    ? 'AUTHENTICATED'
    : 'UNAUTHENTICATED';

  const role: UserRole =
    userProfile?.role || getDesignatedRoleForEmail(currentUser?.email) || 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authLoading,
        profileLoading,
        authState,
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
