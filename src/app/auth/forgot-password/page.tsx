"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel-gold rounded-3xl p-8 border border-[#D4AF37]/35 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-300">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-300">
              Please check your inbox at <span className="text-[#D4AF37] font-semibold">{email}</span> and follow the instructions to set your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 px-5 py-2 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-xs">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Password Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
