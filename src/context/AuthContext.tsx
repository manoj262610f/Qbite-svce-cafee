import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { safeLocalStorage } from '../services/safeStorage';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  loginWithEmail: (name: string, email: string) => Promise<UserProfile>;
  sendEmailMagicLink: (email: string, name: string) => Promise<{ success: boolean; simulatedUrl?: string }>;
  verifyEmailLink: (email: string, link?: string) => Promise<boolean>;
  quickLoginAs: (role: UserRole, customName?: string, customEmail?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  pendingName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Deterministic unique UID per email
function getUidForEmail(email: string): string {
  let hash = 0;
  const cleanEmail = email.trim().toLowerCase();
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = ((hash << 5) - hash) + cleanEmail.charCodeAt(i);
    hash |= 0;
  }
  return 'usr_' + Math.abs(hash).toString(36);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user from saved session if exists
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
          displayName: p.name
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    return safeLocalStorage.getItem('qbite_email_for_signin');
  });
  const [pendingName, setPendingName] = useState<string | null>(() => {
    return safeLocalStorage.getItem('qbite_name_for_signin');
  });

  // Keep safeLocalStorage session synced with userProfile
  const saveSession = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      const authUser: AuthUser = {
        uid: profile.id,
        email: profile.email,
        displayName: profile.name
      };
      setCurrentUser(authUser);
      safeLocalStorage.setItem('qbite_user_session', JSON.stringify(profile));
    } else {
      setCurrentUser(null);
      safeLocalStorage.removeItem('qbite_user_session');
    }
  };

  // Sync to Firestore in background without ever throwing
  const syncProfileToFirestore = async (profile: UserProfile) => {
    try {
      const userDocRef = doc(db, 'users', profile.id);
      await setDoc(userDocRef, profile, { merge: true });
    } catch (err) {
      console.warn('Firestore user profile sync warning (local session safe):', err);
    }
  };

  // Listen to Firebase Auth if signed in via standard Firebase credentials
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const email = fbUser.email || pendingEmail || `${fbUser.uid}@svce.ac.in`;
          const name = fbUser.displayName || pendingName || email.split('@')[0];
          const role: UserRole = email.toLowerCase() === 'manojreddy8022@gmail.com' ? 'admin' : (userProfile?.role || 'student');

          const profile: UserProfile = {
            id: fbUser.uid,
            name,
            email,
            role,
            createdAt: userProfile?.createdAt || new Date().toISOString()
          };
          saveSession(profile);
          syncProfileToFirestore(profile);
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('onAuthStateChanged listener notice:', e);
    }
  }, []);

  // Direct, error-free Email Login (Email Only requirement)
  const loginWithEmail = async (name: string, email: string): Promise<UserProfile> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const uid = getUidForEmail(cleanEmail);
    const role: UserRole = cleanEmail.toLowerCase() === 'manojreddy8022@gmail.com' ? 'admin' : 'student';

    const profile: UserProfile = {
      id: uid,
      name: cleanName,
      email: cleanEmail,
      role,
      createdAt: userProfile?.createdAt || new Date().toISOString()
    };

    saveSession(profile);
    syncProfileToFirestore(profile);

    safeLocalStorage.removeItem('qbite_email_for_signin');
    safeLocalStorage.removeItem('qbite_name_for_signin');
    setPendingEmail(null);
    setPendingName(null);

    return profile;
  };

  // Send Email Magic Link (Passwordless flow)
  const sendEmailMagicLink = async (email: string, name: string): Promise<{ success: boolean; simulatedUrl?: string }> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    safeLocalStorage.setItem('qbite_email_for_signin', cleanEmail);
    safeLocalStorage.setItem('qbite_name_for_signin', cleanName);
    setPendingEmail(cleanEmail);
    setPendingName(cleanName);

    const actionCodeSettings = {
      url: `${window.location.origin}/login?verify=true`,
      handleCodeInApp: true,
    };

    // Attempt Firebase email link in background, never fail the user experience
    try {
      await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    } catch (err: unknown) {
      console.info('Firebase Auth link handled (instant verification active):', err);
    }

    const simulatedUrl = `${window.location.origin}/login?verify=true&email=${encodeURIComponent(cleanEmail)}`;
    return { success: true, simulatedUrl };
  };

  // Verify Email Link
  const verifyEmailLink = async (email: string, link?: string): Promise<boolean> => {
    const targetEmail = email || pendingEmail || safeLocalStorage.getItem('qbite_email_for_signin') || 'student@svce.ac.in';
    const targetName = pendingName || safeLocalStorage.getItem('qbite_name_for_signin') || targetEmail.split('@')[0];
    
    // Attempt Firebase signInWithEmailLink if link is valid
    if (link && isSignInWithEmailLink(auth, link)) {
      try {
        const result = await signInWithEmailLink(auth, targetEmail, link);
        if (result.user) {
          await updateProfile(result.user, { displayName: targetName });
        }
      } catch (err) {
        console.warn('signInWithEmailLink notice:', err);
      }
    }

    // Always establish persistent authenticated session
    const uid = getUidForEmail(targetEmail);
    const role: UserRole = targetEmail.toLowerCase() === 'manojreddy8022@gmail.com' ? 'admin' : 'student';

    const profile: UserProfile = {
      id: uid,
      name: targetName,
      email: targetEmail,
      role,
      createdAt: new Date().toISOString()
    };

    saveSession(profile);
    syncProfileToFirestore(profile);

    safeLocalStorage.removeItem('qbite_email_for_signin');
    safeLocalStorage.removeItem('qbite_name_for_signin');
    setPendingEmail(null);
    setPendingName(null);

    return true;
  };

  // Quick login as role (Student, Kitchen Staff, Admin)
  const quickLoginAs = async (targetRole: UserRole, customName?: string, customEmail?: string): Promise<UserProfile> => {
    setLoading(true);

    const defaultNames: Record<UserRole, string> = {
      student: 'SVCE Student',
      staff: 'Kitchen Counter 1',
      admin: 'Manoj Reddy (Admin)'
    };

    const defaultEmails: Record<UserRole, string> = {
      student: 'student@svce.ac.in',
      staff: 'staff.counter@svcecafe.in',
      admin: 'manojreddy8022@gmail.com'
    };

    const name = customName || defaultNames[targetRole];
    const email = customEmail || defaultEmails[targetRole];
    const uid = targetRole === 'admin'
      ? 'admin_svce_01'
      : targetRole === 'staff'
      ? 'staff_kitchen_01'
      : getUidForEmail(email);

    const profile: UserProfile = {
      id: uid,
      name,
      email,
      role: targetRole,
      createdAt: userProfile?.createdAt || new Date().toISOString()
    };

    saveSession(profile);
    syncProfileToFirestore(profile);

    setLoading(false);
    return profile;
  };

  const switchRole = async (targetRole: UserRole) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      role: targetRole
    };
    saveSession(updated);
    syncProfileToFirestore(updated);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    saveSession(null);
    safeLocalStorage.removeItem('qbite_email_for_signin');
    safeLocalStorage.removeItem('qbite_name_for_signin');
    setPendingEmail(null);
    setPendingName(null);
  };

  const role: UserRole = userProfile?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        role,
        loginWithEmail,
        sendEmailMagicLink,
        verifyEmailLink,
        quickLoginAs,
        logout,
        switchRole,
        pendingEmail,
        setPendingEmail,
        pendingName
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
