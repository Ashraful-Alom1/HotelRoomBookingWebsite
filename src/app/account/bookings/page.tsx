"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings } from "@/services/bookingsService";
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Bed, MessageSquare, Clock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function CustomerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserBookings(user.uid);
        setBookings(data);
      } catch (err) {
        console.error("Error loading user bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadBookings();
    }
  }, [user, authLoading]);

  const hotelPhone = process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || "+8801833075594";
  const cleanPhone = hotelPhone.replace(/[^0-9]/g, "");

  if (authLoading || loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Please log in to your account to view your active and past reservations.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Guest Account
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">My Reservations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your reservation history, dates, payment totals, and real-time confirmation statuses.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusColors = {
              PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
              CONFIRMED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
              REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
              CANCELLED: "bg-slate-500/20 text-slate-300 border-slate-500/30",
              COMPLETED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
              EXPIRED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
            }[booking.status] || "bg-slate-500/20 text-slate-300 border-slate-500/30";

            const waMsg = encodeURIComponent(
              `Hello Grand Horizon Front Desk, I am inquiring about my reservation ${booking.bookingId} for ${booking.roomSnapshot?.name}.`
            );

            return (
              <div
                key={booking.id}
                className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-[#D4AF37]/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-slate-400">Reservation Reference</span>
                    <h3 className="text-lg font-bold text-white">{booking.bookingId}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors}`}
                    >
                      {booking.status}
                    </span>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Desk
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Suite Type</span>
                    <p className="font-bold text-white text-sm mt-0.5">
                      {booking.roomSnapshot?.name || "Suite"}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {booking.roomQuantity} room(s) • {booking.guests} guest(s)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400">Stay Dates</span>
                    <p className="font-semibold text-white mt-0.5">
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    </p>
                    <span className="text-[11px] text-slate-400">{booking.nights} Night(s)</span>
                  </div>

                  <div>
                    <span className="text-slate-400">Total Price</span>
                    <p className="font-extrabold text-[#D4AF37] text-base mt-0.5">
                      {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                    </p>
                    <span className="text-[10px] text-slate-400">Includes taxes & resort fees</span>
                  </div>

                  <div>
                    <span className="text-slate-400">Booked On</span>
                    <p className="text-slate-200 mt-0.5">{formatDate(booking.createdAt)}</p>
                    {booking.adminNote && (
                      <p className="text-[11px] text-amber-300 mt-1">Note: {booking.adminNote}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No active reservations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no booked rooms. Explore our suites to reserve your coastal getaway.
          </p>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase"
          >
            <span>Browse Available Suites</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
