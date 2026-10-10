"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Shield, Clock, Award, CheckCircle, ArrowRight } from "lucide-react";
import { getHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { HotelSettings } from "@/types";

export default function AboutPage() {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);

  useEffect(() => {
    let mounted = true;
    getHotelSettings().then((s) => {
      if (mounted && s) setSettings(s);
    }).catch(() => {});

    const handleUpdate = () => {
      getHotelSettings().then((s) => {
        if (mounted && s) setSettings(s);
      }).catch(() => {});
    };

    window.addEventListener("hotel-settings-updated", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("hotel-settings-updated", handleUpdate);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          About {settings.hotelName || "Grand Horizon"}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Where Heritage Meets Modern Luxury
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {settings.description ||
            `${settings.hotelName || "Grand Horizon"} was envisioned as an architectural sanctuary where travelers discover serenity, bespoke attention, and panoramic coastal elegance.`}
        </p>
      </div>

      {/* Narrative Section */}
      <div className="glass-panel-gold rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 space-y-6 leading-relaxed text-sm text-slate-300">
        <h2 className="text-2xl font-bold text-white">Our Philosophy of Hospitality</h2>
        <p>
          We believe true hospitality lies in the harmony of unhurried comfort, pristine attention to detail, and seamless guest services. From our signature penthouse ocean suites to our handcrafted heritage rooms, each accommodation has been designed with tailored amenities, spa-grade bathroom suites, and acoustic tranquility.
        </p>
        <p>
          Whether visiting for a weekend coastal escape, high-level corporate retreat, or memorable family holiday, our dedicated team remains at your service 24 hours a day.
        </p>
      </div>

      {/* Official Hotel Policies */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Official Guest Guidelines & Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Clock className="w-4 h-4 text-[#D4AF37]" /> Check-In & Check-Out Times
            </div>
            <p>
              Standard check-in begins at <strong>{settings.checkInTime || "2:00 PM"}</strong> and check-out is prior to <strong>{settings.checkOutTime || "11:00 AM"}</strong>. Early arrivals and late departures are accommodated upon request based on suite availability.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-[#D4AF37]" /> Cancellation & Modifications
            </div>
            <p>
              {settings.cancellationPolicy ||
                "Reservations may be cancelled with full refund or zero fee up to 48 hours prior to your scheduled check-in date. Cancellations made inside 48 hours are subject to a one-night room charge."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="w-4 h-4 text-[#D4AF37]" /> Guest Identification
            </div>
            <p>
              {settings.bookingPolicy ||
                "All primary guests must present a valid government-issued photographic identification (Passport, National ID, or Driving License) upon arrival at reception. Minimum check-in age is 18 years."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-[#D4AF37]" /> Smoke-Free Atmosphere
            </div>
            <p>
              To maintain the highest air quality and hygiene, all interior guest suites are strictly non-smoking. Designated outdoor smoking lounges are available on garden terraces.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
        >
          <span>View Available Rooms</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
