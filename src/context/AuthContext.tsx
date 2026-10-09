"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "CUSTOMER",
  isAdmin: false,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setProfile(data);
      } else {
        // Auto-create initial profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Guest",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
          role: "CUSTOMER",
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Fallback customer profile in case Firestore permissions delay
      setProfile({
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || "Customer",
        email: firebaseUser.email || "",
        role: "CUSTOMER",
        accountStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const role: UserRole = profile?.role || "CUSTOMER";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
