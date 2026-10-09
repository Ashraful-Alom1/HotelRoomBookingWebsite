"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Sparkles, Mail, Lock, User, Phone, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: fullName });

      // Save user profile in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: "CUSTOMER",
        accountStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email address already exists.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel-gold rounded-3xl p-8 border border-[#D4AF37]/35 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full gold-gradient-bg mx-auto flex items-center justify-center text-black font-bold shadow-md">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create Guest Account</h1>
          <p className="text-xs text-slate-300">
            Enjoy seamless reservations and track booking statuses
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Jonathan Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Mobile Phone (WhatsApp enabled) *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="+880 1833-075594"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/auth/login" className="text-[#D4AF37] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
