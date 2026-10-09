"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Sparkles, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email address or password.");
      } else {
        setError(err.message || "Failed to sign in. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Google sign-in could not be completed.");
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
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-xs text-slate-300">
            Sign in to access your hotel reservation history and profile
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Email Address</label>
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
            <div className="flex justify-between">
              <label className="text-slate-300 font-semibold">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-[#D4AF37] hover:underline text-[11px]"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In with Email"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest">
            or continue with
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
            />
          </svg>
          Google Account
        </button>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#D4AF37] font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
