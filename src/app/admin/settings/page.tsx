"use client";

import React, { useEffect, useState } from "react";
import { getHotelSettings, updateHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { HotelSettings } from "@/types";
import { Settings, Save, CheckCircle2, MessageSquare, Shield, Clock, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHotelSettings();
        setSettings(data);
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
      setTimeout(() => setSuccess(false), 3000);
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

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Resort Operations
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Hotel & WhatsApp Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure official hotel contact details, check-in policies, and WhatsApp notification routing.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Hotel configuration successfully updated in Cloud Firestore.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Contact & Identity */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white">General Information & Contacts</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Resort Name *</label>
              <input
                type="text"
                required
                value={settings.hotelName}
                onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Marketing Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Telephone Desk</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reservations Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">
                WhatsApp Business Number (Receives booking notifications) *
              </label>
              <input
                type="tel"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Default Tax / Resort Fee (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.taxRatePercent}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Physical Resort Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white">Check-in & Cancellation Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Check-In Time</label>
              <input
                type="text"
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Check-Out Time</label>
              <input
                type="text"
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold">Cancellation Policy Summary</label>
              <textarea
                rows={2}
                value={settings.cancellationPolicy}
                onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Test Button */}
        <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <MessageSquare className="w-5 h-5" /> Test Hotel WhatsApp Link
            </div>
            <p className="text-slate-300 mt-1">
              Open a test message directed at your WhatsApp configuration number (<code>{settings.whatsappNumber}</code>)
            </p>
          </div>

          <a
            href={`https://wa.me/${cleanPhone}?text=Test%20notification%20from%20Grand%20Horizon%20Admin%20Panel`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shrink-0"
          >
            Send Test Alert
          </a>
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
              <Save className="w-5 h-5" /> Save Hotel Configuration
            </>
          )}
        </button>
      </form>
    </div>
  );
}
