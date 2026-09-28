import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
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

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  role: UserRole;
  loginWithGoogle: () => Promise<UserProfile>;
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

  const clearAuthError = () => setAuthError(null);

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

  // Listen to Firebase Auth state on mount and across sessions
  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (!isMounted) return;

        if (fbUser) {
          const uid = fbUser.uid;
          const email = fbUser.email || '';
          const name = fbUser.displayName || email.split('@')[0] || 'SVCE Student';
          const photoURL = fbUser.photoURL || null;

          // Check if user already has an existing role in Firestore
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
            console.warn('onAuthStateChanged: could not fetch user profile from Firestore:', err);
          }

          // Dedicated Admin check for project owner
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

          if (isMounted) {
            saveSession(profile);
            setLoading(false);
          }

          // Merge profile into Firestore
          syncProfileToFirestore(profile);
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
  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    setAuthError(null);

    const provider = new GoogleAuthProvider();
    // Force prompt to ensure user can select their Google account
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const uid = fbUser.uid;
      const email = fbUser.email || '';
      const name = fbUser.displayName || (email ? email.split('@')[0] : 'SVCE Student');
      const photoURL = fbUser.photoURL || null;

      // Check for existing profile in Firestore
      let existingProfile: UserProfile | null = null;
      try {
        const userDocRef = doc(db, 'users', uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          existingProfile = snap.data() as UserProfile;
        }
      } catch (e) {
        console.warn('Google sign-in profile lookup notice:', e);
      }

      const isAdminEmail = email.toLowerCase() === 'manojreddy8022@gmail.com';
      const assignedRole: UserRole = isAdminEmail
        ? 'admin'
        : (existingProfile?.role || 'student');

      const profile: UserProfile = {
        id: uid,
        name,
        email,
        role: assignedRole,
        photoURL,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Save user profile to Firestore users collection
      await syncProfileToFirestore(profile);

      saveSession(profile);
      setLoading(false);
      return profile;
    } catch (error: any) {
      setLoading(false);
      let friendlyMessage = 'Google Sign-In failed. Please try again.';

      if (error?.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Google sign-in was cancelled before completion.';
      } else if (error?.code === 'auth/cancelled-popup-request') {
        friendlyMessage = 'Sign-in was interrupted. Please click Continue with Google again.';
      } else if (error?.code === 'auth/popup-blocked') {
        friendlyMessage = 'The Google sign-in pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
      } else if (error?.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error?.code === 'auth/unauthorized-domain') {
        friendlyMessage = `This domain (${window.location.hostname}) is not authorized for Google Sign-In in Firebase Console. Add it under Firebase Authentication > Settings > Authorized domains.`;
      } else if (error?.message) {
        friendlyMessage = error.message;
      }

      setAuthError(friendlyMessage);
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
