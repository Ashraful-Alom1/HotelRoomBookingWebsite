"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Room } from "@/types";
import { formatCurrency, calculateNights } from "@/lib/utils";
import {
  X,
  Calendar,
  Clock,
  Users,
  Bed,
  Snowflake,
  Wind,
  Phone,
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  FileText,
} from "lucide-react";

interface BookingPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom?: Room | null;
  allRooms?: Room[];
}

export default function BookingPopupModal({
  isOpen,
  onClose,
  selectedRoom = null,
  allRooms = [],
}: BookingPopupModalProps) {
  const [activeRoom, setActiveRoom] = useState<Room | null>(
    selectedRoom || (allRooms.length > 0 ? allRooms[0] : null)
  );

  // Form Fields
  const [acPreference, setAcPreference] = useState<"AC" | "NON_AC">(
    activeRoom?.isAC ? "AC" : "NON_AC"
  );
  const [bedCapacity, setBedCapacity] = useState(
    activeRoom?.bedType || "1 King Bed"
  );
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [stayDuration, setStayDuration] = useState("2"); // nights
  const [checkInTime, setCheckInTime] = useState("12:00 PM");
  const [guestCount, setGuestCount] = useState("2");
  const [guestName, setGuestName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Whenever a room is chosen from the browser selector
  const handleRoomSelect = (roomId: string) => {
    const found = allRooms.find((r) => r.id === roomId || r.slug === roomId);
    if (found) {
      setActiveRoom(found);
      setAcPreference(found.isAC ? "AC" : "NON_AC");
      setBedCapacity(found.bedType);
    }
  };

  const nights = parseInt(stayDuration, 10) || 1;
  const nightlyRate = activeRoom ? activeRoom.pricePerNight : 2590;
  const subtotal = nightlyRate * nights;
  const taxes = Math.round(subtotal * 0.12); // 12% GST standard
  const totalAmount = subtotal + taxes;

  // Calculate check-out date
  const checkIn = new Date(checkInDate);
  const checkOutDate = new Date(checkIn);
  checkOutDate.setDate(checkOutDate.getDate() + nights);
  const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

  const whatsappNumber = "8822308551";

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim() || !contactPhone.trim()) {
      alert("Please provide your Name and Contact Phone Number.");
      return;
    }

    setLoading(true);

    // Format professional WhatsApp message with all details
    const waMessage =
      `🛎️ *NEW HOTEL RESERVATION REQUEST*\n` +
      `🏨 *Resort Hotel Booking*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Guest Name:* ${guestName}\n` +
      `📱 *Contact Phone:* ${contactPhone}\n` +
      (contactEmail ? `✉️ *Email:* ${contactEmail}\n` : "") +
      `🛏️ *Room Selected:* ${activeRoom?.name || "Luxury Suite"}\n` +
      `❄️ *Air Conditioning:* ${acPreference === "AC" ? "AC Suite" : "Non-AC Natural Breeze"}\n` +
      `🛌 *Bed Capacity:* ${bedCapacity}\n` +
      `👥 *Number of Persons:* ${guestCount} Person(s)\n` +
      `📅 *Check-In Date:* ${checkInDate}\n` +
      `⏰ *Check-In Time:* ${checkInTime}\n` +
      `🌙 *Duration:* ${nights} Night(s) (Check-Out: ${formattedCheckOut})\n` +
      `💰 *Total Estimated Price:* ₹${totalAmount.toLocaleString("en-IN")} INR\n` +
      (specialRequests ? `📝 *Special Requests:* "${specialRequests}"\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Please confirm availability and booking details._`;

    // 1. Asynchronously log booking to backend/firestore
    try {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoom?.id || "custom-room",
          checkIn: checkInDate,
          checkOut: formattedCheckOut,
          guests: Number(guestCount),
          customer: {
            fullName: guestName,
            phone: contactPhone,
            email: contactEmail || "guest@hotel.com",
          },
          customerNote: `AC: ${acPreference}, Bed: ${bedCapacity}, Time: ${checkInTime}. ${specialRequests}`,
        }),
      }).catch((err) => console.warn("Background booking save note:", err));
    } catch (e) {
      // ignore
    }

    // 2. Open WhatsApp immediately
    const encoded = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/91${whatsappNumber}?text=${encoded}`;
    window.open(waUrl, "_blank");

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623] text-black flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl font-bold">
                Book Your Luxury Room
              </h2>
              <p className="text-[11px] text-slate-300">
                Instant confirmation directly on WhatsApp ({whatsappNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-slate-900">
              Reservation Sent To WhatsApp!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, <strong className="text-slate-900">{guestName}</strong>! Your reservation request for{" "}
              <strong className="text-slate-900">{activeRoom?.name}</strong> has been forwarded to our WhatsApp reservations desk.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold">{nights} Nights ({checkInDate} to {formattedCheckOut})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-in Time:</span>
                <span className="font-bold">{checkInTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Price:</span>
                <span className="font-bold text-[#F5A623] text-sm">
                  ₹{totalAmount.toLocaleString("en-IN")} INR
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#e0961b] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="overflow-y-auto p-6 space-y-5">
            {/* 1. ROOM BROWSER & SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-[#F5A623]" /> Choose / Browse Room
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allRooms.map((r) => {
                  const isSelected = activeRoom?.id === r.id || activeRoom?.slug === r.slug;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoomSelect(r.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#F5A623] bg-amber-50/60 shadow-md ring-2 ring-[#F5A623]/30"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        <Image
                          src={r.coverImage?.secureUrl || r.gallery?.[0]?.secureUrl || "/images/rooms/HotelRoom.jpg"}
                          alt={r.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {r.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-black text-slate-800">
                            ₹{r.pricePerNight.toLocaleString("en-IN")}
                          </span>
                          <span>•</span>
                          <span>{r.isAC ? "AC" : "Non-AC"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SPECIFICATIONS: AC/NON-AC & BED CAPACITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              {/* AC vs Non-AC Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-sky-600" /> Climate Control
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAcPreference("AC")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                      acPreference === "AC"
                        ? "bg-sky-50 border-sky-400 text-sky-900 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Snowflake className="w-3.5 h-3.5 text-sky-600" /> AC Suite
                  </button>

                  <button
                    type="button"
                    onClick={() => setAcPreference("NON_AC")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                      acPreference === "NON_AC"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5 text-emerald-600" /> Non-AC
                  </button>
                </div>
              </div>

              {/* Bed Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#F5A623]" /> Bed Capacity
                </label>
                <select
                  value={bedCapacity}
                  onChange={(e) => setBedCapacity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="1 King Bed (2 Guests)">1 King Bed (2 Guests)</option>
                  <option value="1 Queen Bed (2 Guests)">1 Queen Bed (2 Guests)</option>
                  <option value="2 Queen Beds (4 Guests)">2 Queen Beds (4 Guests)</option>
                  <option value="2 Twin Beds (2 Guests)">2 Twin Beds (2 Guests)</option>
                  <option value="3 Beds (6 Guests / Family)">3 Beds (6 Guests / Family)</option>
                </select>
              </div>
            </div>

            {/* 3. DATES, HOW LONG, CHECK-IN TIME & PERSONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
              {/* Check-In Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#F5A623]" /> Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {/* How Long (Duration) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F5A623]" /> How Long?
                </label>
                <select
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="1">1 Night</option>
                  <option value="2">2 Nights</option>
                  <option value="3">3 Nights</option>
                  <option value="4">4 Nights</option>
                  <option value="5">5 Nights</option>
                  <option value="7">7 Days 6 Nights</option>
                  <option value="10">10 Nights</option>
                  <option value="14">14 Nights</option>
                </select>
              </div>

              {/* Check-In Time */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F5A623]" /> Check-In Time
                </label>
                <select
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM (Early)</option>
                  <option value="12:00 PM">12:00 PM (Standard)</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM (Evening)</option>
                  <option value="08:00 PM">08:00 PM (Late)</option>
                </select>
              </div>

              {/* Persons (Guests) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#F5A623]" /> How Many?
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="1">1 Person (Solo)</option>
                  <option value="2">2 Persons (Couple)</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons (Family)</option>
                  <option value="5">5 Persons</option>
                  <option value="6">6+ Persons</option>
                </select>
              </div>
            </div>

            {/* 4. GUEST PERSONAL & CONTACT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#F5A623]" /> Guest Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F5A623]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F5A623]" /> Mobile / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F5A623]"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#F5A623]" /> Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F5A623]" /> Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. High floor, extra pillows, early check-in preference"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* 5. PRICING & SUBMIT ACTIONS */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Room Rate ({nights} night{nights > 1 ? "s" : ""}):</span>
                <span className="font-bold">₹{subtotal.toLocaleString("en-IN")} INR</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Estimated Taxes & Service (12%):</span>
                <span className="font-bold">₹{taxes.toLocaleString("en-IN")} INR</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-950 pt-2 border-t border-amber-200">
                <span>Total Estimated Amount:</span>
                <span className="text-xl text-[#F5A623]">₹{totalAmount.toLocaleString("en-IN")} INR</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Confirm & Send to WhatsApp (8822308551)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
