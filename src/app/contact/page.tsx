"use client";

import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Clock, CheckCircle2, Send } from "lucide-react";
import { getHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { HotelSettings } from "@/types";

export default function ContactPage() {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    let mounted = true;
    getHotelSettings().then((data) => {
      if (mounted && data) setSettings(data);
    }).catch(() => {});

    const handleUpdate = () => {
      getHotelSettings().then((data) => {
        if (mounted && data) setSettings(data);
      }).catch(() => {});
    };

    window.addEventListener("hotel-settings-updated", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("hotel-settings-updated", handleUpdate);
    };
  }, []);

  const cleanPhone = (settings.whatsappNumber || "").replace(/[^0-9]/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Connect With Us
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Contact & Concierge Desk</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          We are available 24 hours a day to assist with your bookings, itinerary planning, or custom reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info Card */}
        <div className="glass-panel-gold rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Direct Channels</h2>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Resort Location</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {settings.address || "Marine Drive Road, Cox's Bazar 4700, Bangladesh"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37]">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Telephone Concierge</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{settings.phone || "24/7 Front Desk"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Email Enquiries</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {settings.email || "reservations@grandhorizon.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <MessageSquare className="w-5 h-5" /> Official WhatsApp Desk
            </div>
            <p className="text-xs text-slate-300">
              For immediate room reservations or quick queries, connect directly with our front desk team.
            </p>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(settings.hotelName || "Grand Horizon")}%2C%20I%20would%20like%20to%20connect%20with%20the%20concierge`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Start WhatsApp Conversation
              </a>
            )}
          </div>
        </div>

        {/* Message Form */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 space-y-6">
          <h2 className="text-2xl font-bold text-white">Send an Enquiry</h2>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Dispatched</h3>
              <p className="text-xs text-slate-300">
                Thank you for reaching out. Our reservations team will reply to your email or telephone within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jonathan Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jonathan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1833-075594"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you with your upcoming reservation or stay?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
