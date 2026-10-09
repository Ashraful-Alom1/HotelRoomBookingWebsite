"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Phone,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, profile, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ACTIVITIES", href: "/#popular-rooms" },
    { name: "DESTINATIONS", href: "/rooms" },
    { name: "TOURS", href: "/#popular-rooms" },
    { name: "BLOG", href: "/about" },
    { name: "PAGES", href: "/rooms" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <header className="w-full z-50 bg-[#161719]/95 border-b border-white/10 backdrop-blur-md sticky top-0 transition-all shadow-xl">
      {/* 1. Top Utility Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/10 flex items-center justify-between text-white text-xs">
        {/* Left: Email */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-slate-200">
            <Mail className="w-4 h-4 text-slate-100" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] tracking-wider text-slate-300 font-semibold uppercase">
              DROP US A EMAIL:.
            </span>
            <a
              href="mailto:booking@resorthotel.com"
              className="text-xs font-medium text-slate-200 hover:text-[#F5A623] transition-colors"
            >
              booking@resorthotel.com
            </a>
          </div>
        </div>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex flex-col items-center group">
          <div className="flex items-center justify-center">
            <span className="font-cinzel text-3xl font-bold tracking-widest text-white group-hover:text-[#F5A623] transition-colors">
              H
            </span>
          </div>
          <span className="font-serif-luxury text-[11px] tracking-[0.25em] font-semibold text-slate-200 uppercase mt-[-2px]">
            RESORT HOTEL
          </span>
        </Link>

        {/* Right: Phone & WhatsApp */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div className="flex flex-col">
              <span className="text-[10px] tracking-wider text-slate-300 font-semibold uppercase">
                ANY QUESTIONS? CALL US:.
              </span>
              <a
                href="tel:8822308551"
                className="text-xs font-semibold text-slate-200 hover:text-[#F5A623] transition-colors"
              >
                +91 8822308551 / +00 987-654-321
              </a>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-slate-200">
              <Phone className="w-4 h-4 text-slate-100" />
            </div>
          </div>

          {/* User Auth indicator if signed in */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                <User className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="max-w-[70px] truncate">{profile?.fullName || "Account"}</span>
              </button>
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1c2230] border border-white/10 py-2 shadow-2xl z-50 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <Link
                    href="/account/bookings"
                    className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#F5A623]" /> My Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-[#F5A623] hover:bg-white/10"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Navigation Bar with Golden Search Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] font-bold tracking-widest transition-colors uppercase ${
                    isActive
                      ? "text-[#F5A623]"
                      : "text-slate-200 hover:text-[#F5A623]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Golden Yellow Search Button */}
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="#popular-rooms"
              className="w-10 h-10 bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 transition-all flex items-center justify-center text-slate-950 font-bold shadow-md cursor-pointer"
              title="Search and filter rooms"
              onClick={() => {
                const el = document.getElementById("popular-rooms");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </a>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-200 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161719] border-t border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded text-sm font-semibold tracking-wider uppercase text-slate-200 hover:bg-white/10 hover:text-[#F5A623]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Call Front Desk:</span>
            <a href="tel:8822308551" className="text-[#F5A623] font-bold">
              +91 8822308551
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
