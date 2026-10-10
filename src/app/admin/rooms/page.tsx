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
  MapPin,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Room Modal State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryName: "",
    pricePerNight: 0,
    isAC: true,
    bedType: "",
    maxGuests: 2,
    inventoryQuantity: 1,
    roomSize: "",
    location: "",
    shortDescription: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

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

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name || "",
      categoryName: room.categoryName || "",
      pricePerNight: room.pricePerNight || 0,
      isAC: !!room.isAC,
      bedType: room.bedType || "",
      maxGuests: room.maxGuests || 2,
      inventoryQuantity: room.inventoryQuantity || 1,
      roomSize: room.roomSize || "",
      location: room.location || "",
      shortDescription: room.shortDescription || "",
      status: (room.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setEditSaving(true);
    try {
      await updateRoom(editingRoom.id, {
        name: editForm.name,
        categoryName: editForm.categoryName,
        pricePerNight: Number(editForm.pricePerNight),
        isAC: editForm.isAC,
        bedType: editForm.bedType,
        maxGuests: Number(editForm.maxGuests),
        inventoryQuantity: Number(editForm.inventoryQuantity),
        roomSize: editForm.roomSize,
        location: editForm.location,
        shortDescription: editForm.shortDescription,
        status: editForm.status,
      });
      setEditingRoom(null);
      await loadRooms();
    } catch (err) {
      console.error("Error updating room:", err);
      alert("Failed to update room. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

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

                {room.location && (
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 line-clamp-1 pt-1 border-t border-white/5">
                    <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{room.location}</span>
                  </p>
                )}
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(room)}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Edit Room Information"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(room.id, room.name)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Room Modal Dialog */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0D121F] border border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Suite Details</h3>
                <p className="text-xs text-[#D4AF37]">Updating: {editingRoom.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Room Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.categoryName}
                    onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price Per Night (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={editForm.pricePerNight}
                    onChange={(e) => setEditForm({ ...editForm, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Air Conditioning</label>
                  <select
                    value={editForm.isAC ? "true" : "false"}
                    onChange={(e) => setEditForm({ ...editForm, isAC: e.target.value === "true" })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="true">Air Conditioned (AC)</option>
                    <option value="false">Non-AC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={editForm.bedType}
                    onChange={(e) => setEditForm({ ...editForm, bedType: e.target.value })}
                    placeholder="1 King Bed / 2 Queen Beds"
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editForm.maxGuests}
                    onChange={(e) => setEditForm({ ...editForm, maxGuests: Number(e.target.value) })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Inventory Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.inventoryQuantity}
                    onChange={(e) => setEditForm({ ...editForm, inventoryQuantity: Number(e.target.value) })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Room Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ACTIVE">ACTIVE (Available for Booking)</option>
                    <option value="INACTIVE">INACTIVE (Hidden from Public)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Hotel Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Marine Drive, Kolatoli, Cox's Bazar"
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
