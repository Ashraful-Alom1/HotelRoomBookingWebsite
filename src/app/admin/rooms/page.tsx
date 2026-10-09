"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRooms, deleteRoom, updateRoom } from "@/services/roomsService";
import { Room } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Bed,
  Plus,
  Trash2,
  Edit,
  Snowflake,
  Wind,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteRoom(id);
      await loadRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const toggleStatus = async (room: Room) => {
    const nextStatus = room.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateRoom(room.id, { status: nextStatus });
      await loadRooms();
    } catch (err) {
      console.error("Error toggling room status:", err);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
            Catalog Management
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Rooms & Suites Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure suite specifications, Cloudinary image galleries, and pricing
          </p>
        </div>

        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
        >
          <Plus className="w-4 h-4" /> Add New Suite
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-slate-900">
                <Image
                  src={
                    room.coverImage?.secureUrl ||
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={room.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {room.isAC ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/90 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                      <Snowflake className="w-3 h-3" /> AC
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Non-AC
                    </span>
                  )}
                  <button
                    onClick={() => toggleStatus(room)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      room.status === "ACTIVE"
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {room.status}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-[#D4AF37] font-semibold">{room.categoryName}</p>
                  </div>
                  <span className="text-base font-extrabold text-white">
                    {formatCurrency(room.pricePerNight, room.currency)}
                    <span className="text-xs text-slate-400 font-normal">/n</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <div>Inventory: <strong className="text-white">{room.inventoryQuantity}</strong></div>
                  <div>Capacity: <strong className="text-white">{room.maxGuests} Guests</strong></div>
                  <div>Bed: <strong className="text-white">{room.bedType}</strong></div>
                  <div>Rating: <strong className="text-white">{room.averageRating || 5.0}★</strong></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                href={`/rooms/${room.slug || room.id}`}
                target="_blank"
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public
              </Link>

              <button
                onClick={() => handleDelete(room.id, room.name)}
                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
