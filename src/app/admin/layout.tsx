"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  LayoutDashboard,
  Bed,
  CalendarCheck,
  CalendarRange,
  Star,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Loader2,
  Lock,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, isAdmin, loading, refreshProfile } = useAuth();
  const [elevating, setElevating] = useState(false);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Rooms & Media", href: "/admin/rooms", icon: Bed },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Availability Blocks", href: "/admin/availability", icon: CalendarRange },
    { name: "Review Moderation", href: "/admin/reviews", icon: Star },
    { name: "Hotel Settings", href: "/admin/settings", icon: Settings },
  ];

  // If user is logged in but not yet ADMIN, provide owner-bootstrap capability
  const handleMakeAdmin = async () => {
    if (!user) return;
    setElevating(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { role: "ADMIN" });
      await refreshProfile();
    } catch (err) {
      console.error("Error setting admin role:", err);
    } finally {
      setElevating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel-gold rounded-3xl p-8 border border-[#D4AF37]/30 text-center space-y-4">
          <Lock className="w-12 h-12 text-[#D4AF37] mx-auto" />
          <h2 className="text-2xl font-bold text-white">Admin Staff Portal</h2>
          <p className="text-xs text-slate-300">
            Please authenticate with your hotel management credentials to access the administrative dashboard.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase"
          >
            Sign In to Staff Portal
          </Link>
        </div>
      </div>
    );
  }

  // If logged in as customer, show elevation / access option for owner
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel-gold rounded-3xl p-8 border border-[#D4AF37]/30 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto" />
          <h2 className="text-2xl font-bold text-white">Owner Authorization</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are logged in as <span className="text-white font-bold">{user.email}</span>. Click below to initialize and grant Administrator privileges to this account.
          </p>
          <button
            onClick={handleMakeAdmin}
            disabled={elevating}
            className="w-full py-3 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
          >
            {elevating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grant Admin Permissions"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0A0E17] border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center text-black font-bold">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="text-sm font-bold text-white uppercase tracking-wider block">
                Hotel Admin
              </span>
              <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">
                Control Console
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "gold-gradient-bg text-black shadow-md shadow-[#D4AF37]/15"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#D4AF37]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> View Public Site
          </Link>
          <p className="text-[10px] text-slate-500 truncate">Staff: {user.email}</p>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
