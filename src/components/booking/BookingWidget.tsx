"use client";

import React, { useState, useEffect } from "react";
import { Room } from "@/types";
import { formatCurrency, calculateNights, getTodayDateString, getTomorrowDateString, isPastDate } from "@/lib/utils";
import BookingModal from "./BookingModal";
import { Calendar, Users, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, MessageSquare } from "lucide-react";
import { checkRoomAvailability } from "@/services/bookingsService";

interface BookingWidgetProps {
  room: Room;
}

export default function BookingWidget({ room }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState(() => getTodayDateString());
  const [checkOut, setCheckOut] = useState(() => getTomorrowDateString());
  const [guests, setGuests] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [availabilityState, setAvailabilityState] = useState<{
    checking: boolean;
    isAvailable: boolean;
    remaining: number;
  }>({
    checking: false,
    isAvailable: true,
    remaining: room.inventoryQuantity || 1,
  });

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room.pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      if (nights <= 0) return;
      setAvailabilityState((prev) => ({ ...prev, checking: true }));
      try {
        const res = await checkRoomAvailability(room.id, room.inventoryQuantity || 1, checkIn, checkOut, 1);
        if (isMounted) {
          setAvailabilityState({
            checking: false,
            isAvailable: res.isAvailable,
            remaining: res.remainingInventory,
          });
        }
      } catch (e) {
        if (isMounted) {
          setAvailabilityState({ checking: false, isAvailable: true, remaining: room.inventoryQuantity });
        }
      }
    }

    verify();
    return () => {
      isMounted = false;
    };
  }, [room.id, room.inventoryQuantity, checkIn, checkOut, nights]);

  return (
    <>
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 border border-[#D4AF37]/30 shadow-2xl sticky top-28 space-y-6">
        {/* Pricing Header */}
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Nightly Rate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-white">
                {formatCurrency(room.pricePerNight, room.currency)}
              </span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <div className="text-right">
            {availabilityState.checking ? (
              <span className="text-xs text-slate-400 animate-pulse">Checking inventory...</span>
            ) : availabilityState.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {availabilityState.remaining > 1
                  ? `${availabilityState.remaining} Suites Available`
                  : "1 Suite Left"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Sold Out For Dates
              </span>
            )}
          </div>
        </div>

        {/* Date Selector */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                min={getTodayDateString()}
                onChange={(e) => {
                  const chosen = e.target.value;
                  if (!chosen || isPastDate(chosen)) {
                    setCheckIn(getTodayDateString());
                  } else {
                    setCheckIn(chosen);
                    if (checkOut <= chosen) {
                      setCheckOut(getTomorrowDateString(chosen));
                    }
                  }
                }}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                min={getTomorrowDateString(checkIn)}
                onChange={(e) => {
                  const chosen = e.target.value;
                  if (!chosen || chosen <= checkIn) {
                    setCheckOut(getTomorrowDateString(checkIn));
                  } else {
                    setCheckOut(chosen);
                  }
                }}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Total Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              {Array.from({ length: room.maxGuests || 4 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Breakdown Calculation */}
        {nights > 0 && (
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>
                {formatCurrency(room.pricePerNight, room.currency)} × {nights} nights
              </span>
              <span className="text-white font-medium">{formatCurrency(subtotal, room.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Taxes & Resort Fees (10%)</span>
              <span className="text-white font-medium">{formatCurrency(taxes, room.currency)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10 text-white">
              <span>Estimated Total</span>
              <span className="text-[#D4AF37] text-base">{formatCurrency(total, room.currency)}</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!availabilityState.isAvailable}
          className="w-full py-3.5 rounded-xl bg-[#F5A623] hover:bg-[#e0961b] text-slate-950 font-extrabold text-xs uppercase tracking-wider active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          <span>{availabilityState.isAvailable ? "Reserve Online" : "Room Unavailable"}</span>
        </button>

        {/* Direct WhatsApp Booking Button to 8822308551 */}
        <a
          href={`https://wa.me/918822308551?text=${encodeURIComponent(
            `Hello Resort Hotel! I want to book *${room.name}* (${room.isAC ? "AC" : "Non-AC"}, ${room.bedType}).\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\nRate: ₹${room.pricePerNight.toLocaleString("en-IN")}/night\n\nPlease confirm availability!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Book via WhatsApp (8822308551)</span>
        </a>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Direct WhatsApp Confirmation • Pay at check-in</span>
        </div>
      </div>

      <BookingModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
      />
    </>
  );
}
