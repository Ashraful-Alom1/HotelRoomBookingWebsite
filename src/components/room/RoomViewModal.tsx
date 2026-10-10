"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Room } from "@/types";
import { getRooms } from "@/services/roomsService";
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
  MapPin,
  ExternalLink,
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
  const [roomsList, setRoomsList] = useState<Room[]>(allRooms);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Sync currentRoom if initial prop changes
  useEffect(() => {
    setCurrentRoom(room);
    setActiveCategory("ROOM");
    setSelectedImageIndex(0);
  }, [room]);

  // Ensure other rooms are always loaded and visible automatically
  useEffect(() => {
    if (allRooms && allRooms.length > 1) {
      setRoomsList(allRooms);
    } else {
      getRooms().then((data) => {
        if (data && data.length > 0) {
          setRoomsList(data);
        }
      });
    }
  }, [allRooms]);

  if (!isOpen) return null;

  // Prepare images strictly matching structure:
  // 3 room view images, 2 toilet images, 1 washroom image
  const roomImages =
    currentRoom.gallery && currentRoom.gallery.length > 0
      ? [
          ...(currentRoom.coverImage ? [currentRoom.coverImage] : []),
          ...currentRoom.gallery,
        ]
      : [
          currentRoom.coverImage || { secureUrl: "/images/rooms/images (1).jpg", altText: "Room View 1" },
        ];

  const toiletImages =
    currentRoom.toiletImages && currentRoom.toiletImages.length > 0
      ? currentRoom.toiletImages
      : [
          { secureUrl: "/images/toilets/Toilet.jpg", altText: "Toilet View 1" },
          { secureUrl: "/images/toilets/Toilet2.jpg", altText: "Toilet View 2" },
        ];

  const washroomImages =
    currentRoom.washroomImages && currentRoom.washroomImages.length > 0
      ? currentRoom.washroomImages
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
    modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDropToMainRoomsSection = () => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById("popular-rooms");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#popular-rooms";
      }
    }, 100);
  };

  // Direct WhatsApp Booking link in Indian Currency to 8822308551
  const whatsappNumber = "8822308551";
  const waText = encodeURIComponent(
    `Hello Resort Hotel!\n\nI want to book the *${currentRoom.name}*.\n` +
      `• Rate: ₹${currentRoom.pricePerNight.toLocaleString("en-IN")} INR / night\n` +
      `• Type: ${currentRoom.isAC ? "Air Conditioned (AC)" : "Non-AC"}\n` +
      `• Bed Capacity: ${currentRoom.bedType} (Max ${currentRoom.maxGuests} Guests)\n` +
      `• Location: ${currentRoom.location || "Resort Hotel"}\n\n` +
      `Please let me know the availability and confirmation details.`
  );
  const directWhatsAppUrl = `https://wa.me/91${whatsappNumber}?text=${waText}`;

  // Other rooms to show in scrolling row below (automatically guaranteed)
  const otherRoomsList = roomsList.filter(
    (r) => r.id !== currentRoom.id && r.slug !== currentRoom.slug
  );

  const googleMapEmbedSrc =
    currentRoom.googleMapEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(
      currentRoom.location || "Cox's Bazar Hotel"
    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

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
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div ref={modalBodyRef} className="overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Gallery Category Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange("ROOM")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeCategory === "ROOM"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                Room Views ({roomImages.length} Photos)
              </button>

              <button
                onClick={() => handleCategoryChange("TOILET")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeCategory === "TOILET"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Toilet Views ({toiletImages.length} Photos)
              </button>

              <button
                onClick={() => handleCategoryChange("WASHROOM")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeCategory === "WASHROOM"
                    ? "bg-[#F5A623] text-black shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Bath className="w-4 h-4" />
                Washroom Views ({washroomImages.length} Photos)
              </button>
            </div>

            {/* Featured Photo Viewer Stage - Completely Placed, No Cut-Off, Crystal Clear */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden group shadow-2xl flex items-center justify-center border border-slate-800">
              {/* Ambient blurred backdrop fills the container harmoniously without ugly black bars */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Image
                  src={currentImageUrl}
                  alt="Backdrop blur"
                  fill
                  unoptimized
                  className="object-cover blur-2xl opacity-25 scale-110"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Main crisp uncropped image: object-contain guarantees 100% full view with no cut-off */}
              <div className="relative w-full h-full p-2 sm:p-4 flex items-center justify-center z-10">
                <Image
                  src={currentImageUrl}
                  alt={currentImageAlt}
                  fill
                  unoptimized
                  quality={100}
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Slider Arrows */}
              {currentCategoryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-[#F5A623] text-white hover:text-black transition-all cursor-pointer z-20 shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-[#F5A623] text-white hover:text-black transition-all cursor-pointer z-20 shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter Pill */}
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold z-20 border border-white/10">
                {selectedImageIndex + 1} / {currentCategoryImages.length}
              </div>

              {/* Caption */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full z-20 border border-white/10 font-medium max-w-[70%] truncate">
                {currentImageAlt}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
              {currentCategoryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-[#F5A623] scale-[1.03] shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.secureUrl}
                    alt={img.altText || `Thumb ${idx}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Room Details & Pricing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Left Column (2 cols): Details, Specs, Facilities */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
                    Room Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {currentRoom.description}
                  </p>
                </div>

                {/* Key Specifications Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Bed className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">{currentRoom.bedType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">Max {currentRoom.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Maximize2 className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-semibold">{currentRoom.roomSize}</span>
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
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
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
            {/* GOOGLE MAP & HOTEL LOCATION SECTION */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#F5A623]" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-base font-bold text-slate-900">
                      Hotel Location on Google Map
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <span>{currentRoom.location || "Marine Drive Beachfront Zone, Cox's Bazar"}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    currentRoom.location || currentRoom.name + " Hotel"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#F5A623] hover:text-black text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#F5A623]" />
                  Open in Google Maps
                </a>
              </div>

              {/* Embedded Interactive Google Map */}
              <div className="w-full h-60 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative">
                <iframe
                  title={`Google Map - ${currentRoom.name}`}
                  src={googleMapEmbedSrc}
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
                      Click any suite below to view its 3 room images, 2 toilets, 1 washroom, location & details
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
                          src={
                            otherRoom.coverImage?.secureUrl ||
                            otherRoom.gallery?.[0]?.secureUrl ||
                            "/images/rooms/HotelRoom.jpg"
                          }
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
                        {otherRoom.location && (
                          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-[#F5A623] shrink-0" />
                            {otherRoom.location}
                          </p>
                        )}
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

                {/* Button to smoothly drop down to the rooms main section */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleDropToMainRoomsSection}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-[#F5A623] hover:text-black text-slate-800 text-xs font-extrabold uppercase tracking-wider transition-all border border-slate-300 shadow-sm cursor-pointer"
                  >
                    Smoothly Browse All Suites in Main Catalog Section ↓
                  </button>
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
          allRooms={roomsList}
        />
      )}
    </>
  );
}
