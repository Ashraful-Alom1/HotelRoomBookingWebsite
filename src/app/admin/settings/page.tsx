"use client";

import React, { useEffect, useState } from "react";
import { getHotelSettings, updateHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { HotelSettings } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  Settings,
  Save,
  CheckCircle2,
  MessageSquare,
  Shield,
  Clock,
  Loader2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Eye,
  KeyRound,
  Lock,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user, profile, updateAdminEmail, updateAdminPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<"hotel" | "security">("hotel");

  // Hotel Profile Settings State
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Admin Email Update State
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Admin Password Update State
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHotelSettings();
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error loading settings from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveHotelSettings = async (e: React.FormEvent) => {
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

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail.trim() || !newEmail.includes("@")) {
      setEmailError("Please enter a valid administrative email address.");
      return;
    }
    if (!emailCurrentPassword) {
      setEmailError("Please enter your current administrator password to confirm.");
      return;
    }

    setEmailSaving(true);
    try {
      await updateAdminEmail(newEmail.trim(), emailCurrentPassword);
      setEmailSuccess(`Admin email successfully updated to ${newEmail.trim()} across Firebase Auth & Firestore.`);
      setNewEmail("");
      setEmailCurrentPassword("");
      setTimeout(() => setEmailSuccess(null), 6000);
    } catch (err: any) {
      console.error("Error updating admin email:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setEmailError("Incorrect current password. Re-authentication failed.");
      } else if (err.code === "auth/email-already-in-use") {
        setEmailError("This email address is already associated with another account.");
      } else {
        setEmailError(err.message || "Failed to update admin email in Firebase.");
      }
    } finally {
      setEmailSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters in length.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }
    if (!pwdCurrentPassword) {
      setPwdError("Please enter your current password to authorize this security change.");
      return;
    }

    setPwdSaving(true);
    try {
      await updateAdminPassword(pwdCurrentPassword, newPassword);
      setPwdSuccess("Administrator password updated successfully in Firebase Authentication. Old credentials expired.");
      setPwdCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(null), 6000);
    } catch (err: any) {
      console.error("Error updating admin password:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPwdError("Incorrect current password. Re-authentication failed.");
      } else if (err.code === "auth/weak-password") {
        setPwdError("The chosen password is too weak. Please choose a stronger password.");
      } else {
        setPwdError(err.message || "Failed to update administrator password in Firebase.");
      }
    } finally {
      setPwdSaving(false);
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
      {/* Top Header & Tabs */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Resort Operations
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Management & Security Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage official hotel public details, live Cloudinary assets, and Firebase admin credentials.
        </p>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mt-6 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("hotel")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "hotel"
                ? "gold-gradient-bg text-black shadow-md shadow-[#D4AF37]/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" /> Hotel Profile & Footer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "security"
                ? "gold-gradient-bg text-black shadow-md shadow-[#D4AF37]/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Security & Auth
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 1: HOTEL PROFILE & FOOTER SETTINGS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "hotel" && (
        <div className="space-y-6">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <strong className="block text-white font-semibold">Settings Saved Successfully!</strong>
                Website footer and contact channels have been updated in Firestore & local cache.
              </div>
            </div>
          )}

          <form onSubmit={handleSaveHotelSettings} className="space-y-6 text-xs">
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
                    placeholder="Brief description of the luxury hotel retreat..."
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={settings.tagline || ""}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="e.g. Experience unmatched luxury & serenity"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Channels */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" /> Direct Contact & Location (Footer Column 4)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold">Official Property Address</label>
                  <input
                    type="text"
                    value={settings.address || ""}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="e.g. Marine Drive Road, Cox's Bazar 4700"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Telephone Desk / Contact Number</label>
                  <input
                    type="text"
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
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Concierge Number (Digits only with country code)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || ""}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="e.g. 8801833075594"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" /> Guest Policies & Timing (Footer Column 3)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Standard Check-In Time</label>
                  <input
                    type="text"
                    value={settings.checkInTime || ""}
                    onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                    placeholder="e.g. 2:00 PM"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Standard Check-Out Time</label>
                  <input
                    type="text"
                    value={settings.checkOutTime || ""}
                    onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Cancellation Policy Badge
                  </label>
                  <input
                    type="text"
                    value={settings.cancellationPolicy || ""}
                    onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                    placeholder="e.g. Free 48h Cancellation Policy"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold">Copyright Line</label>
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

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TAB 2: ADMIN SECURITY & AUTHENTICATION SETTINGS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "security" && (
        <div className="space-y-6 text-xs">
          {/* Active Admin Session Status */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl gold-gradient-bg flex items-center justify-center text-black font-bold">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Active Administrator Session</h2>
                  <p className="text-slate-400 text-xs">
                    Protected by Firebase Authentication and Firestore Security Rules.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                LIVE & VERIFIED
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Current Admin Email</span>
                <span className="text-white font-semibold break-all text-xs">
                  {user?.email || "admin@hotel.com"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Administrative Role</span>
                <span className="text-[#D4AF37] font-bold text-xs uppercase">
                  {profile?.role || "ADMIN"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Auth Provider</span>
                <span className="text-slate-300 text-xs">
                  Firebase Authentication
                </span>
              </div>
            </div>
          </div>

          {/* Form 1: Update Admin Email */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Update Administrator Email Address
              </h3>
            </div>
            <p className="text-slate-400 text-[11px]">
              Updating this address immediately updates Firebase Authentication and your Firestore profile. Old email credentials will no longer work.
            </p>

            {emailSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">New Administrator Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newadmin@hotel.com"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Current Password (Required for Auth) *</label>
                  <input
                    type="password"
                    required
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={emailSaving}
                className="py-3 px-6 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {emailSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Synchronizing with Firebase...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-black" />
                    <span>Apply & Update Admin Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form 2: Update Admin Password */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Change Administrator Security Password
              </h3>
            </div>
            <p className="text-slate-400 text-[11px]">
              Sets a new secret password directly in Firebase Authentication. Your previous password will be immediately invalidated across all devices.
            </p>

            {pwdSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5 max-w-md">
                <label className="text-slate-300 font-semibold">Current Administrator Password *</label>
                <input
                  type="password"
                  required
                  value={pwdCurrentPassword}
                  onChange={(e) => setPwdCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">New Security Password (Min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Confirm New Security Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdSaving}
                className="py-3 px-6 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {pwdSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Securing New Password in Firebase...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-black" />
                    <span>Apply & Update Admin Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
