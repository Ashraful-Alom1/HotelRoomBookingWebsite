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
  Upload,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { GalleryImage } from "@/types";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Room Modal State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    name: string;
    categoryName: string;
    pricePerNight: number;
    isAC: boolean;
    bedType: string;
    maxGuests: number;
    inventoryQuantity: number;
    roomSize: string;
    location: string;
    googleMapEmbedUrl: string;
    shortDescription: string;
    description: string;
    amenitiesInput: string;
    status: "ACTIVE" | "INACTIVE";
    coverImage: GalleryImage | null;
    gallery: GalleryImage[];
    toiletImages: GalleryImage[];
    washroomImages: GalleryImage[];
  }>({
    name: "",
    categoryName: "",
    pricePerNight: 0,
    isAC: true,
    bedType: "",
    maxGuests: 2,
    inventoryQuantity: 1,
    roomSize: "",
    location: "",
    googleMapEmbedUrl: "",
    shortDescription: "",
    description: "",
    amenitiesInput: "",
    status: "ACTIVE",
    coverImage: null,
    gallery: [],
    toiletImages: [],
    washroomImages: [],
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

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUploadForEdit = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "bedroom" | "toilet" | "washroom"
  ) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    const files = Array.from(rawFiles);

    setUploadingTarget(target);
    setUploadError(null);

    try {
      const isMultiple = target !== "cover";
      const filesToUpload = isMultiple ? files : [files[0]];
      const newItems: GalleryImage[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgressText(
          filesToUpload.length > 1
            ? `Uploading (${i + 1}/${filesToUpload.length})...`
            : "Uploading to Cloudinary..."
        );

        const base64 = await readFileAsBase64(file);
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            folder: `hotel/rooms/${target}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload to Cloudinary");

        newItems.push({
          publicId: data.publicId,
          secureUrl: data.secureUrl,
          width: data.width,
          height: data.height,
          altText: `${editForm.name || "Suite"} ${target} photo`,
        });
      }

      if (target === "cover") {
        setEditForm((prev) => ({ ...prev, coverImage: newItems[0] || null }));
      } else if (target === "bedroom") {
        setEditForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...newItems] }));
      } else if (target === "toilet") {
        setEditForm((prev) => ({ ...prev, toiletImages: [...prev.toiletImages, ...newItems] }));
      } else if (target === "washroom") {
        setEditForm((prev) => ({ ...prev, washroomImages: [...prev.washroomImages, ...newItems] }));
      }
    } catch (err: any) {
      console.error("Upload error in edit:", err);
      setUploadError(err.message || "Failed to upload image(s)");
    } finally {
      setUploadingTarget(null);
      setUploadProgressText("");
      e.target.value = "";
    }
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setUploadError(null);
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
      googleMapEmbedUrl: room.googleMapEmbedUrl || "",
      shortDescription: room.shortDescription || "",
      description: room.description || "",
      amenitiesInput: room.amenities ? room.amenities.join(", ") : "",
      status: (room.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      coverImage: room.coverImage || null,
      gallery: room.gallery || [],
      toiletImages: room.toiletImages || [],
      washroomImages: room.washroomImages || [],
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setEditSaving(true);
    try {
      const amenities = editForm.amenitiesInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const mapEmbed =
        editForm.googleMapEmbedUrl.trim() ||
        (editForm.location.trim()
          ? `https://maps.google.com/maps?q=${encodeURIComponent(editForm.location.trim())}&t=&z=14&ie=UTF8&iwloc=&output=embed`
          : "");

      const fallbackCover: GalleryImage =
        editForm.coverImage ||
        editingRoom.coverImage || {
          publicId: "default_cover",
          secureUrl:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          altText: editForm.name,
        };

      await updateRoom(editingRoom.id, {
        name: editForm.name.trim(),
        categoryName: editForm.categoryName.trim(),
        pricePerNight: Number(editForm.pricePerNight),
        isAC: editForm.isAC,
        bedType: editForm.bedType.trim(),
        maxGuests: Number(editForm.maxGuests),
        inventoryQuantity: Number(editForm.inventoryQuantity),
        roomSize: editForm.roomSize.trim(),
        location: editForm.location.trim(),
        googleMapEmbedUrl: mapEmbed,
        shortDescription: editForm.shortDescription.trim(),
        description: editForm.description.trim(),
        amenities,
        status: editForm.status,
        coverImage: fallbackCover,
        gallery: editForm.gallery,
        toiletImages: editForm.toiletImages,
        washroomImages: editForm.washroomImages,
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0D121F] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 text-white custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">
                  Suite Catalog Editor
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Edit Suite Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Updating: <strong className="text-white">{editingRoom.name}</strong> • Category: <strong className="text-[#D4AF37]">{editingRoom.categoryName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-6 text-xs">
              {/* Section 1: Basic Suite Specifications */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#D4AF37]" /> Basic Specifications &amp; Pricing
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Room Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.categoryName}
                      onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Price Per Night (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={editForm.pricePerNight}
                      onChange={(e) => setEditForm({ ...editForm, pricePerNight: Number(e.target.value) })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Air Conditioning *</label>
                    <select
                      value={editForm.isAC ? "true" : "false"}
                      onChange={(e) => setEditForm({ ...editForm, isAC: e.target.value === "true" })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="true">Air Conditioned (AC)</option>
                      <option value="false">Non-AC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bed Configuration</label>
                    <input
                      type="text"
                      value={editForm.bedType}
                      onChange={(e) => setEditForm({ ...editForm, bedType: e.target.value })}
                      placeholder="1 King Bed / 2 Queen Beds"
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Floor Area</label>
                    <input
                      type="text"
                      value={editForm.roomSize}
                      onChange={(e) => setEditForm({ ...editForm, roomSize: e.target.value })}
                      placeholder="e.g. 520 sq ft"
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Max Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editForm.maxGuests}
                      onChange={(e) => setEditForm({ ...editForm, maxGuests: Number(e.target.value) })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Inventory Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.inventoryQuantity}
                      onChange={(e) => setEditForm({ ...editForm, inventoryQuantity: Number(e.target.value) })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Room Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ACTIVE">ACTIVE (Available for Booking)</option>
                      <option value="INACTIVE">INACTIVE (Hidden from Public)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Hotel Location & Interactive Google Map */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" /> Hotel Location &amp; Google Map
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Guests can view the interactive map directly on the room details page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hotel Location / Address</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g. Plot 14, Kolatoli Beach Road, Marine Drive, Cox's Bazar"
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Google Map Embed URL <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.googleMapEmbedUrl}
                      onChange={(e) => setEditForm({ ...editForm, googleMapEmbedUrl: e.target.value })}
                      placeholder="https://maps.google.com/maps?q=...&output=embed"
                      className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Live Map Preview */}
                {(editForm.googleMapEmbedUrl.trim() || editForm.location.trim()) && (
                  <div className="rounded-xl overflow-hidden border border-white/15 h-40 bg-slate-900">
                    <iframe
                      title="Room Location Map"
                      src={
                        editForm.googleMapEmbedUrl.trim() ||
                        `https://maps.google.com/maps?q=${encodeURIComponent(editForm.location.trim())}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                      }
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      className="w-full h-full opacity-90"
                    />
                  </div>
                )}
              </div>

              {/* Section 3: Room Details & Descriptions */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Details, Descriptions &amp; Amenities
                </h4>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editForm.shortDescription}
                    onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                    placeholder="Brief 1-line teaser about the suite"
                    className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Room Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Detailed suite narrative, features, materials, and ambiance..."
                    className="w-full bg-[#141A29] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amenities (Comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.amenitiesInput}
                    onChange={(e) => setEditForm({ ...editForm, amenitiesInput: e.target.value })}
                    placeholder="High-Speed WiFi, Mini Bar, Smart TV, Rainfall Shower"
                    className="w-full bg-[#141A29] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Section 4: Cloudinary Media Center (Cover + Galleries) */}
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Cloudinary Suite Media Center
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Upload cover photo and multiple room, washroom, and toilet facility images.
                  </p>
                </div>

                {/* Primary Cover Photo */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">Primary Cover Photo (1 Image)</label>
                    {editForm.coverImage && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        Cover Set
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {uploadingTarget === "cover"
                          ? uploadProgressText || "Uploading..."
                          : editForm.coverImage
                          ? "Change Cover Photo"
                          : "Upload Cover Photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadForEdit(e, "cover")}
                        className="hidden"
                      />
                    </label>

                    {editForm.coverImage && (
                      <div className="relative group w-20 h-14 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-lg">
                        <Image src={editForm.coverImage.secureUrl} alt="Cover preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, coverImage: null }))}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-opacity shadow"
                          title="Remove Cover Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bedroom & Living Gallery */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">
                      Bedroom &amp; Living Gallery ({editForm.gallery.length} {editForm.gallery.length === 1 ? "Photo" : "Photos"})
                    </label>
                    <span className="text-[11px] text-slate-400">Select multiple files at once</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {uploadingTarget === "bedroom"
                          ? uploadProgressText || "Uploading..."
                          : "Upload Multiple Bedroom Photos"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUploadForEdit(e, "bedroom")}
                        className="hidden"
                      />
                    </label>

                    {editForm.gallery.map((img, i) => (
                      <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                        <Image src={img.secureUrl} alt={`Bedroom ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-all shadow"
                          title="Delete Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-slate-300 font-bold py-0.5">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toilet Facilities Gallery */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">
                      Toilet Facilities Gallery ({editForm.toiletImages.length} {editForm.toiletImages.length === 1 ? "Photo" : "Photos"})
                    </label>
                    <span className="text-[11px] text-slate-400">Select multiple files at once</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {uploadingTarget === "toilet"
                          ? uploadProgressText || "Uploading..."
                          : "Upload Multiple Toilet Photos"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUploadForEdit(e, "toilet")}
                        className="hidden"
                      />
                    </label>

                    {editForm.toiletImages.map((img, i) => (
                      <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                        <Image src={img.secureUrl} alt={`Toilet ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              toiletImages: prev.toiletImages.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-all shadow"
                          title="Delete Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-slate-300 font-bold py-0.5">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Washroom & Bath Gallery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">
                      Washroom &amp; Bath Gallery ({editForm.washroomImages.length} {editForm.washroomImages.length === 1 ? "Photo" : "Photos"})
                    </label>
                    <span className="text-[11px] text-slate-400">Select multiple files at once</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {uploadingTarget === "washroom"
                          ? uploadProgressText || "Uploading..."
                          : "Upload Multiple Washroom Photos"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUploadForEdit(e, "washroom")}
                        className="hidden"
                      />
                    </label>

                    {editForm.washroomImages.map((img, i) => (
                      <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                        <Image src={img.secureUrl} alt={`Washroom ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              washroomImages: prev.washroomImages.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-all shadow"
                          title="Delete Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-slate-300 font-bold py-0.5">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Suite Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
