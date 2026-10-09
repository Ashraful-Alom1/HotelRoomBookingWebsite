"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Room } from "@/types";
import BookingPopupModal from "@/components/booking/BookingPopupModal";
import {
  X,
  Star,
  Users,
  Bed,
  Snowflake,
  Wind,
  CheckCircle2,
  Clock,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Bath,
  Layers,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface RoomViewModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  allRooms?: Room[];
}

export default function RoomViewModal({
  room,
  isOpen,
  onClose,
  allRooms = [],
}: RoomViewModalProps) {
  const [currentRoom, setCurrentRoom] = useState<Room>(room);
  const [activeCategory, setActiveCategory] = useState<"ROOM" | "TOILET" | "WASHROOM">("ROOM");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);

  // Sync currentRoom if initial prop changes
  useEffect(() => {
    setCurrentRoom(room);
    setActiveCategory("ROOM");
    setSelectedImageIndex(0);
  }, [room]);

  if (!isOpen) return null;

  // Prepare images strictly matching user's structure:
  // 3 room view images, 2 toilet images, 1 washroom image
  const roomImages =
    currentRoom.gallery && currentRoom.gallery.length >= 3
      ? currentRoom.gallery.slice(0, 3)
      : [
          currentRoom.coverImage || { secureUrl: "/images/rooms/images (1).jpg", altText: "Room View 1" },
          ...(currentRoom.gallery || []),
        ].slice(0, 3);

  const toiletImages =
    currentRoom.toiletImages && currentRoom.toiletImages.length >= 2
      ? currentRoom.toiletImages.slice(0, 2)
      : [
          { secureUrl: "/images/toilets/Toilet.jpg", altText: "Toilet View 1" },
          { secureUrl: "/images/toilets/Toilet2.jpg", altText: "Toilet View 2" },
        ];

  const washroomImages =
    currentRoom.washroomImages && currentRoom.washroomImages.length >= 1
      ? currentRoom.washroomImages.slice(0, 1)
      : [
          { secureUrl: "/images/washrooms/Washroom.jpg", altText: "Washroom View 1" },
        ];

  const currentCategoryImages =
    activeCategory === "ROOM"
      ? roomImages
      : activeCategory === "TOILET"
      ? toiletImages
      : washroomImages;

  const currentImageUrl =
    currentCategoryImages[selectedImageIndex]?.secureUrl ||
    currentCategoryImages[0]?.secureUrl ||
    currentRoom.coverImage?.secureUrl ||
    "/images/rooms/HotelRoom.jpg";

  const currentImageAlt =
    currentCategoryImages[selectedImageIndex]?.altText || currentRoom.name;

  const handleCategoryChange = (cat: "ROOM" | "TOILET" | "WASHROOM") => {
    setActiveCategory(cat);
    setSelectedImageIndex(0);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentCategoryImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? currentCategoryImages.length - 1 : prev - 1
    );
  };

  // When user clicks a different room in the bottom scrolling carousel
  const handleSwitchRoom = (newRoom: Room) => {
    setCurrentRoom(newRoom);
    setActiveCategory("ROOM");
    setSelectedImageIndex(0);
  };

  // Direct WhatsApp Booking link in Indian Currency to 8822308551
  const whatsappNumber = "8822308551";
  const waText = encodeURIComponent(
    `Hello Resort Hotel!\n\nI want to book the *${currentRoom.name}*.\n` +
      `• Rate: ₹${currentRoom.pricePerNight.toLocaleString("en-IN")} INR / night\n` +
      `• Type: ${currentRoom.isAC ? "Air Conditioned (AC)" : "Non-AC"}\n` +
      `• Bed Capacity: ${currentRoom.bedType} (Max ${currentRoom.maxGuests} Guests)\n\n` +
      `Please let me know the availability and confirmation details.`
  );
  const directWhatsAppUrl = `https://wa.me/91${whatsappNumber}?text=${waText}`;

  // Other rooms to show in scrolling row below
  const otherRoomsList = allRooms.filter((r) => r.id !== currentRoom.id && r.slug !== currentRoom.slug);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
                {currentRoom.name}
              </h2>
              {currentRoom.isAC ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
                  <Snowflake className="w-3.5 h-3.5" /> AC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Wind className="w-3.5 h-3.5" /> Non-AC
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Gallery Category Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange("ROOM")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeCategory === "ROOM"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                Room Views (3 Images)
              </button>

              <button
                onClick={() => handleCategoryChange("TOILET")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeCategory === "TOILET"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Bath className="w-4 h-4" />
                Toilets (2 Images)
              </button>

              <button
                onClick={() => handleCategoryChange("WASHROOM")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeCategory === "WASHROOM"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Washroom (1 Image)
              </button>
            </div>

            {/* Interactive Image Viewer */}
            <div className="space-y-3">
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-900 group shadow-md border border-slate-200">
                <Image
                  src={currentImageUrl}
                  alt={currentImageAlt}
                  fill
                  priority
                  unoptimized
                  quality={100}
                  className="object-cover transition-all duration-300"
                />

                {/* Left/Right navigation if more than 1 image in category */}
                {currentCategoryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#F5A623] text-white hover:text-black flex items-center justify-center transition-all shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#F5A623] text-white hover:text-black flex items-center justify-center transition-all shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Active Image Badge */}
                <div className="absolute bottom-3 left-4 bg-black/75 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-md font-semibold">
                  {activeCategory === "ROOM" && `Room View ${selectedImageIndex + 1} of 3`}
                  {activeCategory === "TOILET" && `Toilet View ${selectedImageIndex + 1} of 2`}
                  {activeCategory === "WASHROOM" && "Washroom View 1 of 1"}
                </div>

                {/* Indian Currency Price Tag in Top Right corner */}
                <div className="absolute top-3 right-3 bg-[#F5A623] text-slate-950 font-black text-lg px-4 py-1.5 rounded shadow-lg">
                  ₹{currentRoom.pricePerNight.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {currentCategoryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-[#F5A623] scale-105 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.secureUrl}
                      alt={img.altText || `Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      quality={100}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details & Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Left Column: Room Overview */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
                    Room Overview & Specifications
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {currentRoom.description}
                  </p>
                </div>

                {/* Specs Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Bed className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">{currentRoom.bedType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">Max {currentRoom.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">7 Days 6 Nights</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    {currentRoom.isAC ? (
                      <>
                        <Snowflake className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold text-sky-700">AC Climate Control</span>
                      </>
                    ) : (
                      <>
                        <Wind className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">Non-AC Natural Breeze</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Bath className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">Private Bath & Toilet</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Sanitized Daily</span>
                  </div>
                </div>

                {/* Facilities List */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-2">
                    Room Facilities & Amenities
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(currentRoom.amenities || []).map((amenity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-700 py-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Booking Actions in INR */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-800">
                    Price in Indian Rupees
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{currentRoom.pricePerNight.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ night</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#F5A623] mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F5A623]" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">5.0 (38 Reviews)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Includes 3 room views, 2 toilets, 1 washroom, breakfast & 24/7 service.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-amber-200">
                  {/* WhatsApp Direct Booking Button */}
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Book via WhatsApp ({whatsappNumber})
                  </a>

                  {/* Complete Popup Booking Form */}
                  <button
                    onClick={() => setBookingPopupOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e0961b] text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Book Now (Fill Details)
                  </button>
                </div>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* DYNAMIC SCROLLING CAROUSEL: BROWSE OTHER DIFFERENT ROOMS BELOW */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {otherRoomsList.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
                      Explore Other Different Rooms & Suites
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any suite below to view its 3 room images, 2 toilets, 1 washroom & details
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Scroll horizontally →
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth">
                  {otherRoomsList.map((otherRoom) => (
                    <div
                      key={otherRoom.id}
                      onClick={() => handleSwitchRoom(otherRoom)}
                      className="min-w-[260px] max-w-[260px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-[#F5A623] hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between shrink-0"
                    >
                      <div className="relative aspect-[16/10] w-full bg-slate-200">
                        <Image
                          src={otherRoom.coverImage?.secureUrl || otherRoom.gallery?.[0]?.secureUrl || "/images/rooms/HotelRoom.jpg"}
                          alt={otherRoom.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-[#F5A623] text-black font-black text-xs px-2 py-0.5 rounded shadow">
                          ₹{otherRoom.pricePerNight.toLocaleString("en-IN")}
                        </div>
                        <div className="absolute top-2 left-2">
                          {otherRoom.isAC ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-sky-300">
                              AC
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-emerald-300">
                              Non-AC
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#F5A623] transition-colors">
                          {otherRoom.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          {otherRoom.bedType} • Max {otherRoom.maxGuests} Guests
                        </p>
                        <div className="pt-2 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#F5A623] flex items-center gap-1">
                            Switch View <ArrowRight className="w-3 h-3" />
                          </span>
                          <span className="text-slate-400">3 views + 2 toilets</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Booking Form Popup */}
      {bookingPopupOpen && (
        <BookingPopupModal
          isOpen={bookingPopupOpen}
          onClose={() => setBookingPopupOpen(false)}
          selectedRoom={currentRoom}
          allRooms={allRooms}
        />
      )}
    </>
  );
}
