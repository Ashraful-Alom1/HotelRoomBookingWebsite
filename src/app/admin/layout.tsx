"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Bed,
  CalendarCheck,
  CalendarRange,
  Star,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Restore saved collapse preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_hidden");
      if (saved === "true") setSidebarHidden(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_hidden", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Rooms & Media", href: "/admin/rooms", icon: Bed },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Availability Blocks", href: "/admin/availability", icon: CalendarRange },
    { name: "Review Moderation", href: "/admin/reviews", icon: Star },
    { name: "Hotel Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col md:flex-row relative">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 bg-[#0A0E17] border-r border-white/10 p-6 transition-all duration-300 ease-in-out ${
          sidebarHidden ? "w-0 p-0 border-r-0 overflow-hidden opacity-0 pointer-events-none" : "w-64 opacity-100"
        }`}
      >
        <div className="space-y-6">
          {/* Header with Title and Close / Hide Sidebar Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center text-black font-bold shrink-0">
                <ShieldCheck className="w-4 h-4 text-black" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white uppercase tracking-wider block truncate">
                  Hotel Admin
                </span>
                <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">
                  Control Console
                </span>
              </div>
            </div>

            {/* Close Sidebar Button inside Desktop sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Sidebar (Switch to Large View)"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-300 hover:text-[#D4AF37]" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "gold-gradient-bg text-black shadow-md shadow-[#D4AF37]/15 font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-[#D4AF37]"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & view public link */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> View Public Site
          </Link>
          <p className="text-[10px] text-slate-500 truncate">Staff: {user?.email || "Admin Operator"}</p>
        </div>
      </aside>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 2. MOBILE DRAWER SIDEBAR WITH BACKDROP */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
          <aside className="w-72 bg-[#0A0E17] border-r border-white/10 p-6 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
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

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "gold-gradient-bg text-black shadow-md shadow-[#D4AF37]/15 font-bold"
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
                target="_blank"
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> View Public Site
              </Link>
              <p className="text-[10px] text-slate-500 truncate">Staff: {user?.email || "Admin Operator"}</p>
            </div>
          </aside>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 3. MAIN WORKSPACE WITH TOP TOOLBAR FOR LARGE VIEW TOGGLE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Control Bar for Large View Toggle */}
        <header className="h-14 bg-[#0A0E17]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Desktop Toggle Button: Close / Open Sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-200 hover:text-[#D4AF37] transition-all cursor-pointer shadow-sm"
              title={sidebarHidden ? "Show Sidebar Navigation" : "Hide Sidebar for Large Workspace"}
            >
              {sidebarHidden ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>Show Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#D4AF37]" />
                  <span>Hide Sidebar (Large View)</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {sidebarHidden && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Maximize2 className="w-3 h-3" /> Large View Active
              </span>
            )}
          </div>

          {/* Quick Access to Main Admin Sections when in Large View */}
          {sidebarHidden && (
            <div className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "text-[#D4AF37] bg-white/10 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Public Site</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area - Expands fully in Large View */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
