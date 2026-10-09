"use client";

import React, { useState } from "react";
import { Room } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateNights } from "@/lib/utils";
import { X, Calendar, CheckCircle2, MessageSquare, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export default function BookingModal({
  room,
  isOpen,
  onClose,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 2,
}: BookingModalProps) {
  const { user, profile } = useAuth();

  const [checkIn, setCheckIn] = useState(
    initialCheckIn || new Date().toISOString().split("T")[0]
  );
  // Default checkout is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOut, setCheckOut] = useState(
    initialCheckOut || tomorrow.toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState(initialGuests);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [customerNote, setCustomerNote] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    total: number;
    whatsappUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room.pricePerNight * nights * roomQuantity;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nights <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please provide your full name, email address, and mobile phone number.");
      return;
    }
    if (!agreedToPolicy) {
      setError("Please accept the booking policy to proceed.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          userId: user?.uid || "guest",
          checkIn,
          checkOut,
          guests: Number(guests),
          roomQuantity: Number(roomQuantity),
          customerNote,
          customer: {
            fullName,
            email,
            phone,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking.");
      }

      setConfirmedBooking({
        bookingId: data.bookingId,
        total: data.pricing?.total || total,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred while confirming booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-gold rounded-3xl border border-[#D4AF37]/40 p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full gold-gradient-bg mx-auto flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
              <CheckCircle2 className="w-10 h-10 text-black" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
                Reservation Request Submitted
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Booking ID: {confirmedBooking.bookingId}
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, <span className="text-white font-semibold">{fullName}</span>! Your reservation request for{" "}
                <span className="text-[#D4AF37] font-semibold">{room.name}</span> has been securely recorded.
              </p>
            </div>

            {/* Price breakdown pill */}
            <div className="glass-panel p-4 rounded-2xl max-w-sm mx-auto text-sm border border-white/10 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="text-white">{nights} Nights ({checkIn} to {checkOut})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="text-[#D4AF37] font-bold text-base">
                  {formatCurrency(confirmedBooking.total, room.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Current Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  PENDING CONFIRMATION
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="space-y-3 pt-2">
              {confirmedBooking.whatsappUrl && (
                <a
                  href={confirmedBooking.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full max-w-md px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <MessageSquare className="w-5 h-5" /> Instant WhatsApp Notification to Hotel
                </a>
              )}
              <p className="text-xs text-slate-400">
                Our front desk has received the alert and will confirm your reservation immediately.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* Reservation Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
                Reserve Your Stay
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{room.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {room.bedType} • {room.isAC ? "Air Conditioned" : "Non-AC / Natural Ventilation"} •{" "}
                {formatCurrency(room.pricePerNight, room.currency)} / night
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Dates & Quantities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn}
                  required
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {Array.from({ length: room.maxGuests || 4 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Rooms</label>
                <select
                  value={roomQuantity}
                  onChange={(e) => setRoomQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {Array.from({ length: Math.min(room.inventoryQuantity || 1, 5) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Room{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Guest Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Mobile Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1833-075594"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jonathan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400">Special Requests / Arrival Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Late check-in around 6:00 PM, extra pillows requested."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>
                  {formatCurrency(room.pricePerNight, room.currency)} × {nights} nights × {roomQuantity} room
                </span>
                <span className="text-white font-medium">{formatCurrency(subtotal, room.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes & Luxury Resort Fees (10%)</span>
                <span className="text-white font-medium">{formatCurrency(taxes, room.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10 text-white">
                <span>Total Estimated</span>
                <span className="text-[#D4AF37] text-base">{formatCurrency(total, room.currency)}</span>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-0.5 accent-[#D4AF37]"
              />
              <span>
                I agree to the hotel booking terms, 48-hour free cancellation policy, and valid photo ID requirement upon arrival.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Securing Reservation...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirm Booking Request</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
