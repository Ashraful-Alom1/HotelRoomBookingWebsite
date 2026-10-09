import React from "react";
import Link from "next/link";
import { Sparkles, Phone, Mail, MapPin, MessageSquare, Shield, Clock } from "lucide-react";

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || "+8801833075594";
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <footer className="bg-[#080B12] border-t border-white/10 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center text-black font-bold">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-bold tracking-widest text-white uppercase">
                Grand Horizon
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              An iconic coastal retreat delivering exceptional hospitality, refined architectural luxury, and private sanctuary accommodations.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all text-sm font-semibold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Concierge
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore Suites
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/rooms" className="hover:text-[#D4AF37] transition-colors">
                  All Rooms & Suites
                </Link>
              </li>
              <li>
                <Link href="/rooms?category=penthouse" className="hover:text-[#D4AF37] transition-colors">
                  Penthouse Ocean Suites
                </Link>
              </li>
              <li>
                <Link href="/rooms?category=deluxe" className="hover:text-[#D4AF37] transition-colors">
                  Deluxe Executive (AC)
                </Link>
              </li>
              <li>
                <Link href="/rooms?category=classic" className="hover:text-[#D4AF37] transition-colors">
                  Heritage Classic (Non-AC)
                </Link>
              </li>
              <li>
                <Link href="/rooms?category=family" className="hover:text-[#D4AF37] transition-colors">
                  Family Garden Villas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Guest Policies */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Guest Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Check-in: 2:00 PM | Out: 11:00 AM</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Free 48h Cancellation Policy</span>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-[#D4AF37] transition-colors">
                  Verified Guest Reviews
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D4AF37] transition-colors">
                  Hotel Policies & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Direct Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Marine Drive Road, Cox&apos;s Bazar 4700, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a href="tel:8822308551" className="hover:text-white transition-colors">
                  +91 8822308551 / +00 987-654-321
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a href="mailto:booking@resorthotel.com" className="hover:text-white transition-colors">
                  booking@resorthotel.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Grand Horizon Luxury Suites. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/admin" className="hover:text-[#D4AF37] transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
