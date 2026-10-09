"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types";
import { Maximize2, X, ChevronLeft, ChevronRight, Layers, Bath, Sparkles } from "lucide-react";

interface RoomGalleryProps {
  roomName: string;
  coverImage?: GalleryImage;
  gallery?: GalleryImage[];
  toiletImages?: GalleryImage[];
  washroomImages?: GalleryImage[];
}

export default function RoomGallery({
  roomName,
  coverImage,
  gallery = [],
  toiletImages = [],
  washroomImages = [],
}: RoomGalleryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "room" | "toilet" | "washroom">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Group images
  const allImages: { img: GalleryImage; category: string }[] = [];

  if (coverImage) allImages.push({ img: coverImage, category: "Cover / Bedroom" });
  gallery.forEach((img) => allImages.push({ img, category: "Bedroom & Living" }));
  toiletImages.forEach((img) => allImages.push({ img, category: "Toilet Facility" }));
  washroomImages.forEach((img) => allImages.push({ img, category: "Washroom & Bath" }));

  const filteredImages = allImages.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "room") return item.category.includes("Bedroom") || item.category.includes("Cover");
    if (activeTab === "toilet") return item.category.includes("Toilet");
    if (activeTab === "washroom") return item.category.includes("Washroom");
    return true;
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "all"
              ? "gold-gradient-bg text-black shadow-lg shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Gallery ({allImages.length})
        </button>

        <button
          onClick={() => setActiveTab("room")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "room"
              ? "gold-gradient-bg text-black shadow-lg shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Bedroom & Living ({gallery.length + (coverImage ? 1 : 0)})
        </button>

        <button
          onClick={() => setActiveTab("toilet")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "toilet"
              ? "gold-gradient-bg text-black shadow-lg shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Toilet Gallery ({toiletImages.length})
        </button>

        <button
          onClick={() => setActiveTab("washroom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "washroom"
              ? "gold-gradient-bg text-black shadow-lg shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Bath className="w-3.5 h-3.5" /> Washroom & Bath ({washroomImages.length})
        </button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Featured Photo */}
        {filteredImages[0] && (
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group bg-slate-900 border border-white/10"
          >
            <Image
              src={filteredImages[0].img.secureUrl}
              alt={filteredImages[0].img.altText || roomName}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="absolute bottom-4 left-4">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#D4AF37] text-black shadow-md">
                {filteredImages[0].category}
              </span>
            </div>
          </div>
        )}

        {/* Supporting Thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {filteredImages.slice(1, 3).map((item, idx) => (
            <div
              key={idx + 1}
              onClick={() => openLightbox(idx + 1)}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group bg-slate-900 border border-white/10"
            >
              <Image
                src={item.img.secureUrl}
                alt={item.img.altText || roomName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/70 text-slate-200 border border-white/20">
                  {item.category}
                </span>
              </div>
            </div>
          ))}

          {filteredImages.length > 3 && (
            <div
              onClick={() => openLightbox(3)}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group bg-slate-900 border border-white/10 flex items-center justify-center"
            >
              <Image
                src={filteredImages[3].img.secureUrl}
                alt="View more images"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-50"
              />
              <div className="relative z-10 text-center">
                <span className="text-lg font-bold text-white">+{filteredImages.length - 3} More</span>
                <p className="text-xs text-slate-300">View Full Gallery</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <p className="text-sm font-semibold">{filteredImages[lightboxIndex].category}</p>
              <p className="text-xs text-slate-400">
                {lightboxIndex + 1} of {filteredImages.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <button
              onClick={prevLightbox}
              className="absolute left-2 md:left-6 p-3 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-black transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={filteredImages[lightboxIndex].img.secureUrl}
                alt={filteredImages[lightboxIndex].img.altText || roomName}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={nextLightbox}
              className="absolute right-2 md:right-6 p-3 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-black transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            {filteredImages[lightboxIndex].img.altText || roomName}
          </div>
        </div>
      )}
    </div>
  );
}
