"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Genuine Firebase Admin Sign In
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Authenticate directly against Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Mark active admin session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth_uid", firebaseUser.uid);
      }

      // 3. Sync admin role in Firestore non-blockingly
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(
          userDocRef,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email || email.trim(),
            role: "ADMIN",
            accountStatus: "ACTIVE",
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (firestoreErr) {
        console.warn("Firestore profile sync warning:", firestoreErr);
      }

      // 4. Refresh context and enter Admin Console
      await refreshProfile();
      router.push("/admin");
    } catch (err: any) {
      console.error("Admin sign-in error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-login-credentials" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again in a few minutes or reset your password.");
      } else {
        setError("Something went wrong. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered administrator email address.");
      return;
    }

    setError(null);
    setLoading(true);
    setResetSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to dispatch password recovery email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Public Site
        </Link>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          256-Bit SSL Secured
        </span>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 pt-4">
        <div className="bg-[#0A0E17]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl gold-gradient-bg mx-auto flex items-center justify-center text-black font-bold shadow-lg shadow-[#D4AF37]/20">
              <ShieldCheck className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Hotel Admin Portal
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Executive & Staff Console
              </p>
            </div>

            {/* Mode Switcher Tabs: Only Login & Reset */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setResetSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer text-xs ${
                  mode === "login"
                    ? "bg-[#D4AF37] text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Admin Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                  setResetSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer text-xs ${
                  mode === "reset"
                    ? "bg-[#D4AF37] text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Reset Password
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Password Reset Link Dispatched</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Instructions to reset the administrator password have been emailed to{" "}
                <span className="text-[#D4AF37] font-semibold">{email}</span>. Please verify your inbox and spam folder.
              </p>
            </div>
          )}

          {/* 1. ADMIN SIGN IN FORM */}
          {mode === "login" && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError(null);
                    }}
                    className="text-[#D4AF37] hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-black" />
                    <span>Access Admin Console</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. PASSWORD RESET FORM */}
          {mode === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  A secure password recovery link will be dispatched to this email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-black" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Return to Admin Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-md w-full mx-auto text-center z-10 pt-4">
        <p className="text-[11px] text-slate-500">
          Hotel Management Console • 256-Bit SSL Encrypted & Protected
        </p>
      </div>
    </div>
  );
}
