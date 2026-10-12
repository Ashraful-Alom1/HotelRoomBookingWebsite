"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Phone,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, profile, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ROOMS", href: "/rooms" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <header className="w-full z-50 bg-[#12141A]/95 border-b border-white/10 backdrop-blur-md sticky top-0 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Book Hotels */}
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <span className="font-sans text-2xl sm:text-3xl font-black text-white tracking-tight">
              Book <span className="text-[#00D26A]">Hotels</span>
            </span>
          </Link>

          {/* Desktop Nav Links - Immediate layout view, no page movement */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-4 lg:mx-8">
            <div className="flex items-center space-x-2 lg:space-x-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
                      isActive
                        ? "text-[#F5A623] bg-white/10 shadow-sm"
                        : "text-slate-200 hover:text-[#F5A623] hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/account/bookings"
              className="px-3 sm:px-4 py-1.5 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/15 active:scale-95 text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              My Bookings
            </Link>

            <Link
              href="/rooms"
              className="w-8 h-8 rounded-full bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-[#F5A623] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="All Rooms & Suites"
              aria-label="View Rooms"
            >
              <Heart className="w-4 h-4 fill-[#F5A623]" />
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-200 hover:text-white active:scale-90 transition-all cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161719] border-t border-white/10 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase text-slate-200 hover:bg-white/10 hover:text-[#F5A623] active:bg-white/15 transition-all cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/account/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-lg border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              My Bookings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
