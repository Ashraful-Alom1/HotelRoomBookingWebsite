"use client";

import React, { useEffect, useState } from "react";
import { getHotelSettings, updateHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { HotelSettings } from "@/types";
import { Settings, Save, CheckCircle2, MessageSquare, Shield, Clock, Loader2, Sparkles, MapPin, Phone, Mail, Eye } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHotelSettings();
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateHotelSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  const cleanPhone = (settings.whatsappNumber || "").replace(/[^0-9]/g, "");

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Resort Operations
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Hotel Profile & Footer Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage official hotel details, contact channels, and guest policies. All changes reflect live across the website footer and contact pages.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <strong className="block text-white font-semibold">Settings Saved Successfully!</strong>
            Website footer and contact channels have been updated in Firestore & local cache.
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Identity */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Brand & About Information (Footer Column 1)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Hotel / Resort Name *</label>
              <input
                type="text"
                required
                value={settings.hotelName || ""}
                onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                placeholder="e.g. Grand Horizon Luxury Suites"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">About / Bio Description (Appears in Footer Column 1) *</label>
              <textarea
                rows={3}
                required
                value={settings.description || ""}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="e.g. An iconic coastal retreat delivering exceptional hospitality, refined architectural luxury, and private sanctuary accommodations."
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Marketing Tagline</label>
              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="e.g. Experience unmatched luxury, serene comfort & bespoke hospitality"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" /> Direct Contact & Location (Footer Column 4)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Physical Resort Address *</label>
              <input
                type="text"
                required
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="e.g. Marine Drive Road, Cox's Bazar 4700, Bangladesh"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Telephone Desk / Contact Number</label>
              <input
                type="tel"
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="e.g. +880 1833-075594"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reservations / Contact Email</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="e.g. reservations@grandhorizon.com"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">
                WhatsApp Business Number (Receives booking inquiries & WhatsApp Concierge) *
              </label>
              <input
                type="tel"
                required
                value={settings.whatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. +8801833075594"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Include country code without special characters (e.g. +8801833075594). Used for direct WhatsApp booking redirection.
              </p>
            </div>
          </div>
        </div>

        {/* Check-In & Guest Policies */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" /> Guest Services & Policies (Footer Column 3)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Check-In Time *</label>
              <input
                type="text"
                required
                value={settings.checkInTime || ""}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                placeholder="e.g. 2:00 PM"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Check-Out Time *</label>
              <input
                type="text"
                required
                value={settings.checkOutTime || ""}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                placeholder="e.g. 11:00 AM"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Cancellation Policy Summary *</label>
              <input
                type="text"
                required
                value={settings.cancellationPolicy || ""}
                onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                placeholder="e.g. Free 48h Cancellation Policy"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Footer Copyright Text</label>
              <input
                type="text"
                value={settings.copyrightText || ""}
                onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                placeholder="e.g. Grand Horizon Luxury Suites. All rights reserved."
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Footer Preview */}
        <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4" /> Live Footer Display Preview
          </div>
          <p className="text-[11px] text-slate-400">
            This is how your footer will appear to website visitors with your current inputs:
          </p>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-[11px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Brand Column</span>
                <span className="text-white font-bold block">{settings.hotelName || "Grand Horizon"}</span>
                <span className="text-slate-400 text-[10px] line-clamp-2">{settings.description}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Guest Services</span>
                <span className="text-slate-300 block">Check-in: {settings.checkInTime || "2:00 PM"} | Out: {settings.checkOutTime || "11:00 AM"}</span>
                <span className="text-slate-300 block">{settings.cancellationPolicy || "Free 48h Cancellation Policy"}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Direct Contact</span>
                <span className="text-slate-300 block">{settings.address || "No address set"}</span>
                <span className="text-slate-300 block">{settings.phone || "No phone set"}</span>
                <span className="text-slate-300 block">{settings.email || "No email set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Test Alert */}
        <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <MessageSquare className="w-5 h-5" /> Test Hotel WhatsApp Connection
            </div>
            <p className="text-slate-300 mt-1">
              Verify your WhatsApp link ({settings.whatsappNumber ? <code>{settings.whatsappNumber}</code> : "Not configured"})
            </p>
          </div>

          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}?text=Test%20notification%20from%20${encodeURIComponent(settings.hotelName || "Resort")}%20Admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shrink-0 shadow-md"
            >
              Send Test Message
            </a>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving Settings...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Hotel Configuration & Update Footer
            </>
          )}
        </button>
      </form>
    </div>
  );
}
