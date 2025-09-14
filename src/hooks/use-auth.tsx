"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dob?: string;
  voice: string;
  memory: string;
  voiceModeEnabled: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true); // Set loading to true when auth state changes
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const profile = doc.data() as UserProfile;
            // Ensure a default voice is set if it's missing
            if (!profile.voice) {
              profile.voice = 'erinome';
            }
            setUserProfile(profile);
          } else {
            // This can happen if the user record exists in Auth but not in Firestore
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
            setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

    if (!user && !isAuthPage) {
        router.replace('/login');
    } else if (user && isAuthPage) {
        router.replace('/chat');
    }
  }, [user, loading, pathname, router]);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    }
  };

  const value = { user, userProfile, loading, updateUserProfile };

  // Render children immediately to avoid hydration issues.
  // Child components are responsible for showing their own loading states.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
