import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, getUserProfile, saveUserProfile } from '../lib/firebase';
import { UserProfile, Role } from '../types/hospital';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoAccount: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string, role?: Role, phone?: string, bloodGroup?: string) => Promise<void>;
  loginAsDemoPatient: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PATIENT: UserProfile = {
  uid: 'demo-patient-1',
  email: 'alex.mercer@example.com',
  name: 'Alex Mercer',
  role: 'patient',
  phone: '+1 (555) 234-5678',
  age: 34,
  gender: 'Male',
  bloodGroup: 'O+',
  emergencyContact: 'Sarah Mercer (+1 555-987-6543)',
  createdAt: new Date().toISOString()
};

const DEMO_ADMIN: UserProfile = {
  uid: 'demo-admin-1',
  email: 'admin@greenlife.hospital',
  name: 'Dr. Administrator (Medical Officer)',
  role: 'admin',
  phone: '+1 (800) 473-3654',
  createdAt: new Date().toISOString()
};

const getDeterminedRole = (email?: string | null, requestedRole?: Role): Role => {
  if (!email) return requestedRole || 'patient';
  const normalized = email.toLowerCase().trim();
  if (normalized === 'whitedragon5771@gmail.com' || normalized.includes('admin') || normalized === 'admin@greenlife.hospital') {
    return 'admin';
  }
  if (normalized === 'benitofarayar.26csa@licet.ac.in') {
    return 'patient';
  }
  return requestedRole || 'patient';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsDemoAccount(false);
        // Load profile from firestore
        let profile = await getUserProfile(fbUser.uid);
        const expectedRole = getDeterminedRole(fbUser.email, profile?.role);

        if (!profile) {
          profile = {
            uid: fbUser.uid,
            email: fbUser.email || 'user@hospital.com',
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            role: expectedRole,
            createdAt: new Date().toISOString()
          };
          await saveUserProfile(profile);
        } else if (profile.role !== expectedRole) {
          profile = { ...profile, role: expectedRole };
          await saveUserProfile(profile);
        }
        setUser(profile);
      } else {
        if (!isDemoAccount) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoAccount]);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      let profile = await getUserProfile(fbUser.uid);
      const expectedRole = getDeterminedRole(fbUser.email, profile?.role);

      if (!profile) {
        profile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role: expectedRole,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      } else if (profile.role !== expectedRole) {
        profile = { ...profile, role: expectedRole };
        await saveUserProfile(profile);
      }
      setUser(profile);
      setIsDemoAccount(false);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup was closed by user.');
      } else {
        console.error('Google sign in error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      let profile = await getUserProfile(fbUser.uid);
      const expectedRole = getDeterminedRole(email, profile?.role);

      if (!profile) {
        profile = {
          uid: fbUser.uid,
          email,
          name: email.split('@')[0],
          role: expectedRole,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      } else if (profile.role !== expectedRole) {
        profile = { ...profile, role: expectedRole };
        await saveUserProfile(profile);
      }
      setUser(profile);
      setIsDemoAccount(false);
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        console.info('Email sign-in attempt failed due to invalid credentials.');
      } else {
        console.error('Email sign in error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    name: string, 
    email: string, 
    pass: string, 
    role: Role = 'patient',
    phone?: string,
    bloodGroup?: string
  ) => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      const expectedRole = getDeterminedRole(email, role);

      const profile: UserProfile = {
        uid: fbUser.uid,
        email,
        name,
        role: expectedRole,
        phone: phone || '',
        bloodGroup: bloodGroup || '',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
      setUser(profile);
      setIsDemoAccount(false);
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        console.info('Signup attempted with an already existing email address.');
      } else {
        console.error('Signup error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoPatient = () => {
    setIsDemoAccount(true);
    setUser(DEMO_PATIENT);
    setLoading(false);
  };

  const loginAsDemoAdmin = () => {
    setIsDemoAccount(true);
    setUser(DEMO_ADMIN);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (isDemoAccount) {
      setIsDemoAccount(false);
      setUser(null);
      setLoading(false);
    } else {
      await fbSignOut(auth);
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (!isDemoAccount && user.uid) {
      await saveUserProfile(updated);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      isAdmin,
      isDemoAccount,
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      loginAsDemoPatient,
      loginAsDemoAdmin,
      logout,
      updateProfileData
    }}>
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
