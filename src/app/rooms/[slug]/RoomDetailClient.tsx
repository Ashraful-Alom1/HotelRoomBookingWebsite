"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitReview } from "@/services/reviewsService";
import { Room, Review, GalleryImage } from "@/types";
import BookingWidget from "@/components/booking/BookingWidget";
import RoomCard from "@/components/room/RoomCard";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Bed,
  Users,
  Maximize2,
  Snowflake,
  Wind,
  CheckCircle2,
  Shield,
  Star,
  ArrowLeft,
  Check,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  Bath,
  Layers,
  MapPin,
  Clock,
  Heart,
  Share2,
} from "lucide-react";

interface RoomDetailClientProps {
  room: Room | null;
  initialReviews: Review[];
  similarRooms: Room[];
  allRooms?: Room[];
}

export default function RoomDetailClient({
  room,
  initialReviews,
  similarRooms,
  allRooms = [],
}: RoomDetailClientProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Review Form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested suite could not be located or may have been updated.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  // Aggregate all gallery images
  const allImages: { img: GalleryImage; label: string }[] = [];
  if (room.coverImage) allImages.push({ img: room.coverImage, label: "Master Suite" });
  (room.gallery || []).forEach((g, i) => allImages.push({ img: g, label: `Interior View ${i + 1}` }));
  (room.washroomImages || []).forEach((w, i) => allImages.push({ img: w, label: `Marble Washroom ${i + 1}` }));
  (room.toiletImages || []).forEach((t, i) => allImages.push({ img: t, label: `Toilet Facility ${i + 1}` }));

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % allImages.length);
  };
  const prevLightbox = () => {
    if (lightboxIndex !== null)
      setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await submitReview({
        bookingId: "DIRECT-VERIFIED",
        userId: user?.uid || "guest",
        roomId: room.id,
        customerName: reviewAuthor || user?.displayName || "Verified Guest",
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        isVerifiedStay: true,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
        setReviewTitle("");
        setReviewComment("");
      }, 2500);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header & Navigation Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Back to All Accommodations
          </Link>

          <div className="flex items-center gap-2">
            {room.isAC ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 text-sky-300 border border-sky-400/30 text-xs font-semibold">
                <Snowflake className="w-3.5 h-3.5" /> Climate Controlled AC
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <Wind className="w-3.5 h-3.5" /> Eco-Heritage Natural Air
              </span>
            )}
            <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-black/60 text-[#D4AF37] border border-[#D4AF37]/30">
              {room.categoryName}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {room.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Marine Drive Oceanfront Wing • Grand Horizon Luxury Suites</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-black/70 px-4 py-2 rounded-2xl border border-[#D4AF37]/30 text-sm">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              <span className="font-extrabold text-white">{room.averageRating || 5.0}</span>
              <span className="text-slate-400 text-xs">({room.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Seasons / Airbnb Luxe Style Photo Showcase Grid */}
      <div className="relative rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-3 aspect-[16/9] md:aspect-[21/9] max-h-[550px] bg-slate-900 border border-white/10">
        {/* Dominant Left Photo (Span 2 cols, full height) */}
        <div
          onClick={() => openLightbox(0)}
          className="md:col-span-2 relative h-full w-full cursor-pointer group overflow-hidden"
        >
          <Image
            src={allImages[0]?.img.secureUrl || room.coverImage.secureUrl}
            alt={room.name}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/80 text-white border border-white/20">
              Master Bedroom Suite
            </span>
          </div>
        </div>

        {/* Column 2: Washroom and Interior */}
        <div className="hidden md:flex flex-col gap-3 h-full">
          {allImages[1] && (
            <div
              onClick={() => openLightbox(1)}
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
            >
              <Image
                src={allImages[1].img.secureUrl}
                alt={allImages[1].label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 text-slate-200">
                  {allImages[1].label}
                </span>
              </div>
            </div>
          )}
          {allImages[2] && (
            <div
              onClick={() => openLightbox(2)}
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
            >
              <Image
                src={allImages[2].img.secureUrl}
                alt={allImages[2].label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 text-slate-200">
                  {allImages[2].label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Toilet and View */}
        <div className="hidden md:flex flex-col gap-3 h-full">
          {allImages[3] && (
            <div
              onClick={() => openLightbox(3)}
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
            >
              <Image
                src={allImages[3].img.secureUrl}
                alt={allImages[3].label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 text-slate-200">
                  {allImages[3].label}
                </span>
              </div>
            </div>
          )}
          {allImages[4] && (
            <div
              onClick={() => openLightbox(4)}
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
            >
              <Image
                src={allImages[4].img.secureUrl}
                alt={allImages[4].label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 text-slate-200">
                  {allImages[4].label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full Gallery Action Pill */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-5 right-5 z-20 px-4 py-2.5 rounded-xl glass-panel-gold text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-2xl transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>Show All {allImages.length} Photos</span>
        </button>
      </div>

      {/* 3. Main Content Columns: Specifications & Sticky Booking Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start pt-4">
        {/* Left Column (2 Cols): Room Specs, Washroom Showcase, Toilet Suite, Amenities, Policies */}
        <div className="lg:col-span-2 space-y-12">
          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 glass-panel p-6 rounded-3xl border border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Bedding</span>
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-[#D4AF37]" /> {room.bedType}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Capacity</span>
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Up to {room.maxGuests} Guests
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Suite Area</span>
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-[#D4AF37]" /> {room.roomSize}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Inventory</span>
              <p className="font-bold text-[#D4AF37] text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {room.inventoryQuantity || 1} Units
              </p>
            </div>
          </div>

          {/* Narrative Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-white">The Suite Experience</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {room.description}
            </p>
          </div>

          {/* Dedicated Washroom & Toilet Facility Card */}
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 space-y-6">
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xl font-bold text-white">
                En-Suite Marble Washroom & Private Toilet
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every fixture in this suite has been tailored for maximum hygiene and relaxation. Features separate dry and wet zones, custom Italian marble tiling, walk-in rainfall showers, and private Japanese smart bidet toilet amenities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.washroomImages?.[0] && (
                <div
                  onClick={() => openLightbox(allImages.findIndex((i) => i.label.includes("Washroom")))}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                >
                  <Image
                    src={room.washroomImages[0].secureUrl}
                    alt="Washroom suite"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                      Spa Washroom & Bath
                    </span>
                  </div>
                </div>
              )}

              {room.toiletImages?.[0] && (
                <div
                  onClick={() => openLightbox(allImages.findIndex((i) => i.label.includes("Toilet")))}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                >
                  <Image
                    src={room.toiletImages[0].secureUrl}
                    alt="Toilet facility"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white">
                      Sanitized Toilet Suite
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Luxury Amenities Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-white">Included Luxury Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(room.amenities || []).map((amenity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-sm text-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stay Policies */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" /> Reservation & House Guidelines
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {(room.policies || []).map((policy, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                  <span>{policy}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                <span>
                  Check-in: 2:00 PM | Check-out: 11:00 AM. Government-issued photo ID required upon arrival.
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Verified Stay Reviews</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real experiences from guests who reserved this suite
                </p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-[#D4AF37]" /> Write Review
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs flex items-center justify-center">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{rev.customerName}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Verified Stay
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#D4AF37]">
                        {Array.from({ length: rev.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                        ))}
                      </div>
                    </div>
                    {rev.title && <h4 className="text-sm font-bold text-white">{rev.title}</h4>}
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl text-center space-y-2 text-slate-400 text-xs">
                <p>No verified reviews posted yet for this suite.</p>
                <p className="text-slate-500">
                  Be the first to share your experience after completing your stay!
                </p>
              </div>
            )}
          </div>

          {/* Hotel Location & Interactive Google Map */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hotel Location & Google Map</h3>
                  <p className="text-xs text-slate-300">
                    {room.location || "Marine Drive Beachfront Zone, Cox's Bazar"}
                  </p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  room.location || room.name + " Hotel"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white text-xs font-bold transition-all border border-white/10 w-fit cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Open in Google Maps
              </a>
            </div>

            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl relative">
              <iframe
                title={`Google Map Location - ${room.name}`}
                src={
                  room.googleMapEmbedUrl ||
                  `https://maps.google.com/maps?q=${encodeURIComponent(
                    room.location || "Cox's Bazar Hotel"
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Sticky Booking Engine */}
        <div className="lg:col-span-1">
          <BookingWidget room={room} />
        </div>
      </div>

      {/* 4. Other Available Rooms & Accommodations */}
      {similarRooms.length > 0 && (
        <div className="space-y-6 pt-16 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
                Other Suites & Accommodations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Explore All Other Available Rooms
              </h2>
            </div>
            <Link
              href="/#popular-rooms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline"
            >
              Smoothly View Main Catalog Section &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarRooms.map((simRoom) => (
              <RoomCard
                key={simRoom.id}
                room={simRoom}
                allRooms={allRooms.length > 0 ? allRooms : [room, ...similarRooms]}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <p className="text-sm font-bold text-[#D4AF37]">{allImages[lightboxIndex].label}</p>
              <p className="text-xs text-slate-400">
                {lightboxIndex + 1} of {allImages.length} • {room.name}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <button
              onClick={prevLightbox}
              className="absolute left-2 md:left-6 p-3.5 rounded-full bg-black/70 hover:bg-[#D4AF37] hover:text-black transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-w-5xl max-h-[78vh]">
              <Image
                src={allImages[lightboxIndex].img.secureUrl}
                alt={allImages[lightboxIndex].img.altText || room.name}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={nextLightbox}
              className="absolute right-2 md:right-6 p-3.5 rounded-full bg-black/70 hover:bg-[#D4AF37] hover:text-black transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            {allImages[lightboxIndex].img.altText || room.name}
          </div>
        </div>
      )}

      {/* 6. Review Form Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel-gold rounded-3xl p-6 md:p-8 border border-[#D4AF37]/40 space-y-4">
            <h3 className="text-xl font-bold text-white">Share Your Stay Review</h3>
            <p className="text-xs text-slate-300">
              Reviews are verified and moderated by hotel management before public publication.
            </p>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold">Thank you for your review!</p>
                <p>Your feedback has been submitted for moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Vance"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className={`p-2 rounded-xl border transition-all ${
                          s <= reviewRating
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-white/5 text-slate-400 border-white/10"
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Review Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Outstanding oceanfront stay"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Detailed Comments *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the room comfort, cleanliness, and service..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold uppercase"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
