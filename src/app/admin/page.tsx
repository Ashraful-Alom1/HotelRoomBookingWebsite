"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBookings, updateBookingStatus } from "@/services/bookingsService";
import { getRooms } from "@/services/roomsService";
import { Booking, Room, BookingStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  Bed,
  Users,
  MessageSquare,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [bData, rData] = await Promise.all([getAllBookings(), getRooms()]);
      setBookings(bData);
      setRooms(rData);
    } catch (err) {
      console.error("Error loading admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, status);
      await loadData();
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  // KPIs
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
  const totalInventory = rooms.reduce((sum, r) => sum + (r.inventoryQuantity || 1), 0);

  const recentBookings = bookings.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
            Management Console
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Operational Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/rooms/new"
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" /> Add New Room
          </Link>
          <Link
            href="/admin/bookings"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/10"
          >
            All Bookings
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{pendingBookings}</span>
            {pendingBookings > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Awaiting front-desk confirmation</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Confirmed Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{confirmedBookings}</span>
          <p className="text-[11px] text-slate-400">Locked in system inventory</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Confirmed Revenue</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-3xl font-black text-[#D4AF37]">
            {formatCurrency(totalRevenue, "INR")}
          </span>
          <p className="text-[11px] text-slate-400">From confirmed stays</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Room Inventory</span>
            <Bed className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-3xl font-black text-white">{totalInventory} Units</span>
          <p className="text-[11px] text-slate-400">Across {rooms.length} suite categories</p>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Reservation Requests</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and immediately update guest reservation states
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>View All ({totalBookings})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Guest</th>
                  <th className="py-3 px-2">Suite</th>
                  <th className="py-3 px-2">Dates</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-white">{b.bookingId}</td>
                    <td className="py-3.5 px-2">
                      <p className="font-semibold text-white">{b.customer.fullName}</p>
                      <p className="text-[10px] text-slate-400">{b.customer.phone}</p>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="font-medium text-white">{b.roomSnapshot?.name}</span>
                      <span className="block text-[10px] text-slate-400">
                        {b.roomQuantity} room(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span>
                        {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                      </span>
                      <span className="block text-[10px] text-slate-400">{b.nights} nights</span>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#D4AF37]">
                      {formatCurrency(b.pricing.total, b.pricing.currency)}
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300"
                            : b.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : b.status === "REJECTED"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, "REJECTED")}
                              className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold text-[10px] uppercase transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleStatusChange(b.id, "COMPLETED")}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold text-[10px] uppercase transition-colors"
                          >
                            Check-Out / Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-6 text-slate-500 text-xs">No bookings recorded yet.</p>
        )}
      </div>
    </div>
  );
}
