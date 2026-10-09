"use client";

import React, { useEffect, useState } from "react";
import { getAllBookings, updateBookingStatus } from "@/services/bookingsService";
import { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNoteBooking, setActiveNoteBooking] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const loadData = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      await loadData();
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      await updateBookingStatus(id, bookings.find((b) => b.id === id)?.status || "PENDING", noteText);
      setActiveNoteBooking(null);
      await loadData();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.phone.includes(searchQuery);
    return matchesStatus && matchesQuery;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Front-Desk Operations
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Bookings & Reservations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review incoming requests, manage reservation states, and record notes
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                statusFilter === st
                  ? "gold-gradient-bg text-black shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const cleanPhone = b.customer.phone.replace(/[^0-9]/g, "");
            const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
              b.customer.fullName
            )}%2C%20regarding%20your%20Grand%20Horizon%20booking%20${b.bookingId}...`;

            return (
              <div
                key={b.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-white">
                      {b.bookingId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : b.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : b.status === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Guest
                    </a>

                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                      className="bg-slate-900 border border-white/20 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>

                    <button
                      onClick={() => {
                        setActiveNoteBooking(b.id);
                        setNoteText(b.adminNote || "");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200"
                    >
                      {b.adminNote ? "Edit Note" : "+ Add Note"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
                  <div>
                    <span className="text-slate-500 font-semibold">Guest Contact</span>
                    <p className="font-bold text-white text-sm mt-0.5">{b.customer.fullName}</p>
                    <p>{b.customer.phone}</p>
                    <p className="text-slate-400">{b.customer.email}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold">Reserved Accommodation</span>
                    <p className="font-bold text-white text-sm mt-0.5">{b.roomSnapshot?.name}</p>
                    <p>{b.roomQuantity} Room(s) • {b.guests} Guests</p>
                    <p>{b.roomSnapshot?.isAC ? "Air Conditioned" : "Non-AC Room"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold">Stay Schedule</span>
                    <p className="font-semibold text-white mt-0.5">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </p>
                    <p>{b.nights} Night(s)</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold">Financial Summary</span>
                    <p className="font-extrabold text-[#D4AF37] text-base mt-0.5">
                      {formatCurrency(b.pricing.total, b.pricing.currency)}
                    </p>
                    <p className="text-slate-400">
                      Subtotal: {formatCurrency(b.pricing.subtotal, b.pricing.currency)} + Tax: {formatCurrency(b.pricing.taxes, b.pricing.currency)}
                    </p>
                  </div>
                </div>

                {b.customerNote && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-bold text-slate-400">Guest Special Request: </span>
                    <span className="text-slate-200">&ldquo;{b.customerNote}&rdquo;</span>
                  </div>
                )}

                {b.adminNote && activeNoteBooking !== b.id && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <span className="font-bold">Staff Note: </span>
                    <span>{b.adminNote}</span>
                  </div>
                )}

                {activeNoteBooking === b.id && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-[#D4AF37]/40 space-y-2">
                    <label className="font-bold text-white">Staff / Internal Note</label>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="e.g. VIP guest arrival, requested early check-in confirmed via call"
                      className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setActiveNoteBooking(null)}
                        className="px-3 py-1 rounded bg-white/10 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNote(b.id)}
                        className="px-3 py-1 rounded gold-gradient-bg text-black font-bold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 text-xs">
            No bookings match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
