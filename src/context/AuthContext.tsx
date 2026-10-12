"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as fbSignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  updateAdminEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateAdminPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "CUSTOMER",
  isAdmin: false,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
  updateAdminEmail: async () => {},
  updateAdminPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const isStoredAdmin = typeof window !== "undefined" && sessionStorage.getItem("admin_auth_uid") === firebaseUser.uid;

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setProfile({
          ...data,
          role: isStoredAdmin ? "ADMIN" : (data.role || "ADMIN"),
          email: firebaseUser.email || data.email,
        });
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Administrator",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
          role: "ADMIN",
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn("Firestore profile create warning:", e);
        }
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile({
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || "Administrator",
        email: firebaseUser.email || "",
        role: "ADMIN",
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
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth_uid");
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      await fetchUserProfile(currentUser);
    }
  };

  const updateAdminEmail = async (newEmail: string, currentPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No active administrator session detected.");
    }

    // 1. Re-authenticate with current credentials
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // 2. Update email in Firebase Auth
    try {
      await updateEmail(currentUser, newEmail);
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed") {
        await verifyBeforeUpdateEmail(currentUser, newEmail);
      } else {
        throw err;
      }
    }

    // 3. Update Firestore profile immediately, overwriting old email
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      email: newEmail,
      updatedAt: serverTimestamp(),
    });

    // 4. Update immediate state and reload profile across system
    setUser(auth.currentUser);
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser);
    }
  };

  const updateAdminPassword = async (currentPassword: string, newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No active administrator session detected.");
    }

    // 1. Re-authenticate with current password
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // 2. Update password in Firebase Auth
    await updatePassword(currentUser, newPassword);

    // 3. Update Firestore audit timestamp
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      updatedAt: serverTimestamp(),
    });

    // 4. Sync session
    setUser(auth.currentUser);
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser);
    }
  };

  const role: UserRole = profile?.role || (user ? "ADMIN" : "CUSTOMER");
  const isAdmin = role === "ADMIN" || !!user;

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
        updateAdminEmail,
        updateAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
