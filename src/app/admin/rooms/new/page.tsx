"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createRoom } from "@/services/roomsService";
import { GalleryImage } from "@/types";
import {
  Upload,
  ArrowLeft,
  Snowflake,
  Wind,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  MapPin,
} from "lucide-react";

export default function NewRoomPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("Deluxe Suite");
  const [categoryId, setCategoryId] = useState("deluxe");
  const [isAC, setIsAC] = useState(true);
  const [pricePerNight, setPricePerNight] = useState(4500);
  const [bedType, setBedType] = useState("1 King Bed");
  const [roomSize, setRoomSize] = useState("500 sq ft");
  const [maxGuests, setMaxGuests] = useState(2);
  const [inventoryQuantity, setInventoryQuantity] = useState(5);
  const [location, setLocation] = useState("Marine Drive, Kolatoli, Cox's Bazar");
  const [googleMapEmbedUrl, setGoogleMapEmbedUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [amenitiesInput, setAmenitiesInput] = useState(
    "High-Speed WiFi, Climate Control AC, 55\" Smart TV, Rainfall Shower, Mini Bar, Electronic Safe"
  );

  // Cloudinary Upload Arrays
  const [coverImage, setCoverImage] = useState<GalleryImage | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [toiletImages, setToiletImages] = useState<GalleryImage[]>([]);
  const [washroomImages, setWashroomImages] = useState<GalleryImage[]>([]);

  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "bedroom" | "toilet" | "washroom"
  ) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    const files = Array.from(rawFiles);

    setUploadingTarget(target);
    setError(null);

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
          altText: `${name || "Suite"} ${target} photo`,
        });
      }

      if (target === "cover") {
        setCoverImage(newItems[0] || null);
      } else if (target === "bedroom") {
        setGallery((prev) => [...prev, ...newItems]);
      } else if (target === "toilet") {
        setToiletImages((prev) => [...prev, ...newItems]);
      } else if (target === "washroom") {
        setWashroomImages((prev) => [...prev, ...newItems]);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image(s)");
    } finally {
      setUploadingTarget(null);
      setUploadProgressText("");
      // Reset input value so same files can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const fallbackCover: GalleryImage = coverImage || {
      publicId: "default_cover",
      secureUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      altText: name,
    };

    const amenities = amenitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      await createRoom({
        name: name.trim(),
        slug,
        categoryId,
        categoryName,
        isAC,
        pricePerNight: Number(pricePerNight),
        currency: "INR",
        bedType,
        roomSize,
        maxGuests: Number(maxGuests),
        inventoryQuantity: Number(inventoryQuantity),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        location: location.trim(),
        googleMapEmbedUrl:
          googleMapEmbedUrl.trim() ||
          (location.trim()
            ? `https://maps.google.com/maps?q=${encodeURIComponent(location.trim())}&t=&z=14&ie=UTF8&iwloc=&output=embed`
            : ""),
        amenities,
        policies: [
          "Check-in: 2:00 PM | Check-out: 11:00 AM",
          "Smoke-free suite",
          "Government photo ID required upon arrival",
        ],
        status: "ACTIVE",
        featured: false,
        coverImage: fallbackCover,
        gallery,
        toiletImages,
        washroomImages,
        averageRating: 5.0,
        reviewCount: 0,
      });

      router.push("/admin/rooms");
    } catch (err: any) {
      console.error("Room creation error:", err);
      setError(err.message || "Failed to save room.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/rooms"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
            Suite Configuration
          </span>
          <h1 className="text-2xl font-extrabold text-white">Add New Suite / Accommodation</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Core Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white">Basic Suite Specifications</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Suite Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Oceanfront Panoramic Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category *</label>
              <select
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setCategoryId(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                }}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="Penthouse Suite">Penthouse Suite</option>
                <option value="Deluxe Suite">Deluxe Suite</option>
                <option value="Heritage Classic">Heritage Classic</option>
                <option value="Family Villa">Family Villa</option>
                <option value="Standard Room">Standard Room</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nightly Rate (INR - ₹) *</label>
              <input
                type="number"
                min="1000"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
              <p className="text-[11px] text-amber-400 font-medium pt-0.5">
                {isAC
                  ? "• AC Rate Guideline: ₹4,000 up to ₹12,000 (varies based on room capacity)"
                  : "• Non-AC Rate Guideline: ₹2,500 up to ₹5,000 (varies based on room capacity)"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Climate Control *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAC(true);
                    if (pricePerNight < 4000) setPricePerNight(4500);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold border flex items-center justify-center gap-1.5 ${
                    isAC
                      ? "bg-sky-500 text-black border-sky-400"
                      : "bg-white/5 text-slate-300 border-white/10"
                  }`}
                >
                  <Snowflake className="w-4 h-4" /> AC Suite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAC(false);
                    if (pricePerNight > 5000) setPricePerNight(2800);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold border flex items-center justify-center gap-1.5 ${
                    !isAC
                      ? "bg-emerald-500 text-black border-emerald-400"
                      : "bg-white/5 text-slate-300 border-white/10"
                  }`}
                >
                  <Wind className="w-4 h-4" /> Non-AC
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Bed Configuration *</label>
              <input
                type="text"
                required
                placeholder="1 King Bed"
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Max Guests</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Available Units (Inventory Quantity)</label>
              <input
                type="number"
                min="1"
                value={inventoryQuantity}
                onChange={(e) => setInventoryQuantity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Floor Area</label>
              <input
                type="text"
                placeholder="550 sq ft"
                value={roomSize}
                onChange={(e) => setRoomSize(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Short Summary</label>
            <input
              type="text"
              placeholder="One line teaser about the view or key amenity"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Full Description</label>
            <textarea
              rows={3}
              placeholder="Describe the interior, materials, vistas, and ambiance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Amenities (Comma-separated)</label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
            />
          </div>

          {/* Hotel Location & Google Map Configuration */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Hotel & Room Location Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide the address or geographical area. Guests will see this location and interactive Google Map.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Hotel Location / Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 14, Kolatoli Beach Road, Marine Drive, Cox's Bazar"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">
                Google Map Embed URL <span className="text-slate-500 font-normal">(Optional - auto-generated from address if empty)</span>
              </label>
              <input
                type="text"
                placeholder="https://maps.google.com/maps?q=...&output=embed"
                value={googleMapEmbedUrl}
                onChange={(e) => setGoogleMapEmbedUrl(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
              />
            </div>

            {/* Map Preview */}
            {location.trim() && (
              <div className="rounded-xl overflow-hidden border border-white/15 h-44 bg-slate-900">
                <iframe
                  title="Location Preview"
                  src={
                    googleMapEmbedUrl.trim() ||
                    `https://maps.google.com/maps?q=${encodeURIComponent(location.trim())}&t=&z=14&ie=UTF8&iwloc=&output=embed`
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
        </div>

        {/* Media Uploaders to Cloudinary */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Cloudinary Media Center</h2>
            <p className="text-slate-400">
              Upload photos directly into your Cloudinary cloud (<code>web8vmww</code>) organized by category.
            </p>
          </div>

          {/* Cover Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Primary Cover Photo (1 Image)</label>
              {coverImage && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Cover Ready
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {uploadingTarget === "cover"
                    ? uploadProgressText || "Uploading..."
                    : coverImage
                    ? "Change Cover Photo"
                    : "Select Cover Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "cover")}
                  className="hidden"
                />
              </label>

              {coverImage && (
                <div className="relative group w-20 h-14 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-lg">
                  <Image src={coverImage.secureUrl} alt="Cover preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition-opacity shadow"
                    title="Remove Cover Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bedroom Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Bedroom &amp; Living Gallery ({gallery.length} {gallery.length === 1 ? "Photo" : "Photos"})
              </label>
              <span className="text-[11px] text-slate-400">Select multiple files at once</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
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
                  onChange={(e) => handleFileUpload(e, "bedroom")}
                  className="hidden"
                />
              </label>

              {gallery.map((img, i) => (
                <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                  <Image src={img.secureUrl} alt={`Bedroom ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
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

          {/* Toilet Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Toilet Facilities Gallery ({toiletImages.length} {toiletImages.length === 1 ? "Photo" : "Photos"})
              </label>
              <span className="text-[11px] text-slate-400">Select multiple files at once</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
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
                  onChange={(e) => handleFileUpload(e, "toilet")}
                  className="hidden"
                />
              </label>

              {toiletImages.map((img, i) => (
                <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                  <Image src={img.secureUrl} alt={`Toilet ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setToiletImages((prev) => prev.filter((_, idx) => idx !== i))}
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

          {/* Washroom Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Washroom &amp; Bath Gallery ({washroomImages.length} {washroomImages.length === 1 ? "Photo" : "Photos"})
              </label>
              <span className="text-[11px] text-slate-400">Select multiple files at once</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 border border-white/15 transition-all">
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
                  onChange={(e) => handleFileUpload(e, "washroom")}
                  className="hidden"
                />
              </label>

              {washroomImages.map((img, i) => (
                <div key={i} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shadow">
                  <Image src={img.secureUrl} alt={`Washroom ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setWashroomImages((prev) => prev.filter((_, idx) => idx !== i))}
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

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving Suite to Catalog...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Publish Suite to Firestore
            </>
          )}
        </button>
      </form>
    </div>
  );
}
