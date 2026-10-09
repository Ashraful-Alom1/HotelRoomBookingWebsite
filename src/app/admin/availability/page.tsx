"use client";

import React, { useEffect, useState } from "react";
import { getAvailabilityBlocks, createAvailabilityBlock, releaseAvailabilityBlock } from "@/services/availabilityService";
import { getRooms } from "@/services/roomsService";
import { AvailabilityBlock, Room } from "@/types";
import { formatDate } from "@/lib/utils";
import { CalendarRange, Plus, ShieldAlert, CheckCircle2, Loader2, Trash2 } from "lucide-react";

export default function AdminAvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<"MAINTENANCE" | "PRIVATE_USE" | "TEMPORARY_BLOCK" | "OTHER">("MAINTENANCE");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [bData, rData] = await Promise.all([getAvailabilityBlocks(), getRooms()]);
      setBlocks(bData);
      setRooms(rData);
      if (rData.length > 0 && !selectedRoomId) {
        setSelectedRoomId(rData[0].id);
      }
    } catch (err) {
      console.error("Error loading availability blocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      await createAvailabilityBlock({
        roomId: selectedRoomId,
        startDate,
        endDate,
        quantity: Number(quantity),
        reason,
        status: "ACTIVE",
        createdBy: "ADMIN",
      });
      await loadData();
      setEndDate("");
    } catch (err) {
      console.error("Error creating block:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseBlock = async (blockId: string) => {
    try {
      await releaseAvailabilityBlock(blockId);
      await loadData();
    } catch (err) {
      console.error("Error releasing block:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Inventory Control
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Availability & Maintenance Blocks</h1>
        <p className="text-xs text-slate-400 mt-1">
          Lock out specific dates or units for routine refurbishment, VIP private reservations, or seasonal maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Block Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Create New Block
          </h2>

          <form onSubmit={handleCreateBlock} className="space-y-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Select Suite *</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.inventoryQuantity} total)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">End Date *</label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Quantity of Units to Block</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reason for Blackout</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
              >
                <option value="MAINTENANCE">Maintenance / Refurbishment</option>
                <option value="PRIVATE_USE">VIP / Private Use</option>
                <option value="TEMPORARY_BLOCK">Temporary Hold</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Availability Block"}
            </button>
          </form>
        </div>

        {/* Existing Blocks List */}
        <div className="lg:col-span-2 space-y-4 text-xs">
          <h2 className="text-base font-bold text-white">Active Blockout Records</h2>

          {blocks.length > 0 ? (
            <div className="space-y-3">
              {blocks.map((block) => {
                const roomMatch = rooms.find((r) => r.id === block.roomId);
                const isActive = block.status === "ACTIVE";

                return (
                  <div
                    key={block.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {roomMatch?.name || "Suite"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isActive
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {block.status}
                        </span>
                      </div>
                      <p className="text-slate-400">
                        {formatDate(block.startDate)} → {formatDate(block.endDate)} •{" "}
                        <strong className="text-white">{block.quantity} unit(s)</strong> blocked
                      </p>
                      <p className="text-[#D4AF37] font-semibold">{block.reason}</p>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleReleaseBlock(block.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-semibold transition-colors"
                      >
                        Release Block
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-3xl">
              No active blackout blocks configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
