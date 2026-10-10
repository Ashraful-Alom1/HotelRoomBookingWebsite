"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRooms, FALLBACK_ROOMS } from "@/services/roomsService";
import { getHotelSettings, DEFAULT_HOTEL_SETTINGS } from "@/services/settingsService";
import { Room, HotelSettings } from "@/types";
import RoomCard from "@/components/room/RoomCard";
import BookingPopupModal from "@/components/booking/BookingPopupModal";
import GuestsRoomsModal, { RoomConfig } from "@/components/booking/GuestsRoomsModal";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Snowflake,
  Wind,
  Bed,
  Users,
  DollarSign,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Calendar,
  Waves,
  Coffee,
  Utensils,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Tv,
  Wifi,
  HeartHandshake,
  Compass,
} from "lucide-react";

import { getTodayDateString, getTomorrowDateString, isPastDate } from "@/lib/utils";

const HERO_SLIDES = [
  {
    image: "/images/rooms/Okura-Nikko-Top-hero-2026-autumn-4.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "World-class hospitality, tranquil suites & bespoke seaside comfort",
  },
  {
    image: "/images/rooms/deluxe_bedroom.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "Step into modern elegance with breathtaking panoramic views",
  },
  {
    image: "/images/rooms/luxury-bedroom-suite-resort-high-rise-hotel-with-working-table_105762-1783.avif",
    title: "Enjoy A Luxury Experience",
    subtitle: "Indulge in five-star architecture and private jacuzzi suites",
  },
  {
    image: "/images/rooms/penthouse_bedroom.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "Exclusive penthouse living with oceanfront balconies",
  },
  {
    image: "/images/rooms/family_villa.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "Spacious luxury family villas with private botanical gardens",
  },
];

export default function HomePage() {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [rooms, setRooms] = useState<Room[]>(FALLBACK_ROOMS);
  const [loading, setLoading] = useState(false);

  // Dynamic Hero Slides from live rooms catalog
  const heroSlides =
    rooms.length > 0
      ? rooms.slice(0, 6).map((r) => ({
          image: r.coverImage?.secureUrl || "/images/rooms/deluxe_bedroom.jpg",
          title: "Enjoy A Luxury Experience",
          subtitle:
            r.shortDescription ||
            r.description ||
            `${r.name} - ${r.isAC ? "Air Conditioned" : "Non-AC"} Comfort`,
        }))
      : HERO_SLIDES;

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search Widget State (Matching Screenshot 1 Layout - dynamically tracks current date)
  const [destinationQuery, setDestinationQuery] = useState("");
  const [checkInDate, setCheckInDate] = useState(() => getTodayDateString());
  const [checkOutDate, setCheckOutDate] = useState(() => getTomorrowDateString());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Guests & Rooms State (Matching Screenshot 2 & 3 Modal)
  const [guestsModalOpen, setGuestsModalOpen] = useState(false);
  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>([
    { id: 1, adults: 2, children: 0, childrenAges: [], isEditing: false },
  ]);

  // Filter States
  const [acFilter, setAcFilter] = useState<"ALL" | "AC" | "NON_AC">("ALL");
  const [bedFilter, setBedFilter] = useState<"ALL" | "1" | "2" | "3+">("ALL");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "UNDER_4000" | "4000_7000" | "OVER_7000">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Universal Booking Popup State
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);
  const [bookingPopupRoom, setBookingPopupRoom] = useState<Room | null>(null);

  // Search & Booking Modal State (Opens when clicking BOOK NOW in Hero)
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [roomsData, settingsData] = await Promise.all([
          getRooms(),
          getHotelSettings(),
        ]);
        if (mounted) {
          if (roomsData && roomsData.length > 0) {
            setRooms(roomsData);
          }
          if (settingsData) {
            setSettings(settingsData);
          }
        }
      } catch (err) {
        console.error("Failed to load rooms & settings from Firestore:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();

    const handleUpdate = () => {
      getHotelSettings().then((s) => mounted && setSettings(s)).catch(() => {});
      getRooms().then((r) => mounted && setRooms(r)).catch(() => {});
    };
    window.addEventListener("hotel-settings-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("hotel-settings-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Automatic hero slider cycle every 4.5 seconds in continuous loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentSlide, heroSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handleNearMe = () => {
    setDestinationQuery("Cox's Bazar");
    const el = document.getElementById("popular-rooms");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = () => {
    const el = document.getElementById("popular-rooms");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Formatted date string for Box 2 (e.g. "11 Oct - 12 Oct 2026")
  const formatDisplayDates = (inStr: string, outStr: string) => {
    try {
      const d1 = new Date(inStr);
      const d2 = new Date(outStr);
      const o1 = d1.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const o2 = d2.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return `${o1} - ${o2}`;
    } catch {
      return "11 Oct - 12 Oct 2026";
    }
  };

  // Formatted guests string for Box 3 (e.g. "6 Adult 3 Children, 3 Rooms")
  const totalAdults = roomConfigs.reduce((acc, r) => acc + r.adults, 0);
  const totalChildren = roomConfigs.reduce((acc, r) => acc + r.children, 0);
  const guestsSummaryText = `${totalAdults} Adult${totalAdults !== 1 ? "s" : ""}${
    totalChildren > 0 ? ` ${totalChildren} Children` : ""
  }, ${roomConfigs.length} Room${roomConfigs.length > 1 ? "s" : ""}`;

  // Filter Logic with reactive filtering in Indian Currency
  const filteredRooms = rooms.filter((room) => {
    // AC / Non-AC Radio Filter (replacing Destination and Search by PNR radio options)
    if (acFilter === "AC" && !room.isAC) return false;
    if (acFilter === "NON_AC" && room.isAC) return false;

    // Destination / Keyword query from "Where to?" box OR keyword search input
    const query = (destinationQuery || searchQuery).trim().toLowerCase();
    if (query) {
      const words = query.split(/\s+/).filter((w) => w.length > 1);
      const pool = `${room.name} ${room.location || ""} ${room.categoryName} ${room.bedType} ${(room.amenities || []).join(" ")}`.toLowerCase();
      const hasMatch = pool.includes(query) || (words.length > 0 && words.some((w) => pool.includes(w)));
      if (!hasMatch) return false;
    }

    // Bed capacity filter
    if (bedFilter === "1") {
      const isSingleOrOneBed =
        room.bedType.toLowerCase().includes("1 king") ||
        room.bedType.toLowerCase().includes("1 queen") ||
        room.maxGuests <= 2;
      if (!isSingleOrOneBed) return false;
    } else if (bedFilter === "2") {
      const isTwoBeds =
        room.bedType.toLowerCase().includes("2") ||
        room.name.toLowerCase().includes("double") ||
        room.name.toLowerCase().includes("family") ||
        room.maxGuests === 4;
      if (!isTwoBeds) return false;
    } else if (bedFilter === "3+") {
      const isLarge =
        room.bedType.toLowerCase().includes("3") ||
        room.maxGuests >= 5 ||
        room.name.toLowerCase().includes("villa");
      if (!isLarge) return false;
    }

    // Indian Currency Price Filter (₹)
    if (priceFilter === "UNDER_4000" && room.pricePerNight > 4000) return false;
    if (priceFilter === "4000_7000" && (room.pricePerNight < 4000 || room.pricePerNight > 7000)) return false;
    if (priceFilter === "OVER_7000" && room.pricePerNight < 7000) return false;

    return true;
  });

  const handleOpenBookingPopup = (specificRoom?: Room | null) => {
    setBookingPopupRoom(specificRoom || (rooms.length > 0 ? rooms[0] : null));
    setBookingPopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 1. HERO SECTION WITH EXACT SCREENSHOT 1 SEARCH ARRANGEMENT */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-[75vh] sm:min-h-[92vh] w-full overflow-hidden flex flex-col justify-center items-center bg-[#0B0D13] py-6 sm:py-14 px-4 sm:px-6">
        {/* Background Images with smooth Ken-Burns scale and crossfade transition */}
        {heroSlides.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                unoptimized
                quality={100}
                className={`object-cover object-[center_38%] sm:object-center brightness-[0.45] sm:brightness-[0.4] transition-transform duration-[4500ms] ease-out ${
                  isActive ? "scale-100 sm:scale-105" : "scale-100"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/85" />
            </div>
          );
        })}

        {/* Left Slider Arrow Button */}
        <button
          type="button"
          onClick={handlePrevSlide}
          className="flex absolute left-2 sm:left-6 z-20 w-8 h-8 sm:w-11 sm:h-11 bg-[#F5A623] hover:bg-[#e0961b] active:scale-90 text-slate-950 items-center justify-center transition-all shadow-lg rounded-full cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Top Text Just Below Navbar: "Find the right place to stay" */}
        <div className="relative z-20 text-center px-4 max-w-2xl mx-auto space-y-1.5 pt-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            Find the right place to stay
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto">
            Bespoke luxury suites, beach villas &amp; tranquil coastal stays
          </p>
        </div>

        {/* Hero Main Content (Previously existed "Enjoy A Luxury Experience" + "BOOK NOW" button) */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-5 my-auto py-6">
          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-normal text-white drop-shadow-lg tracking-normal leading-tight">
            Enjoy A Luxury <br />
            Experience
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium max-w-xl mx-auto drop-shadow">
            World-class hospitality, tranquil suites &amp; bespoke seaside comfort
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-block bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 font-black text-sm uppercase px-8 sm:px-10 py-3.5 tracking-wider transition-all shadow-2xl rounded-xl cursor-pointer"
            >
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Slide Indicators: Real-time animated transformation dots */}
        <div className="relative z-20 flex items-center gap-2 pt-1 pb-1">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                currentSlide === idx
                  ? "w-8 bg-[#F5A623] shadow-md shadow-[#F5A623]/50"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Explore Rooms bottom scroll cue */}
        <div className="relative z-20 pb-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("popular-rooms");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-[#F5A623] uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Explore All Rooms ↓
          </button>
        </div>

        {/* Right Slider Arrow Button */}
        <button
          type="button"
          onClick={handleNextSlide}
          className="flex absolute right-2 sm:right-6 z-20 w-8 h-8 sm:w-11 sm:h-11 bg-[#F5A623] hover:bg-[#e0961b] active:scale-90 text-slate-950 items-center justify-center transition-all shadow-lg rounded-full cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[3]" />
        </button>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 2. ROOMS SECTION ("OUR MOST POPULAR ROOMS" - 100% VISIBLE) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="popular-rooms" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Our Most Popular Rooms
            </h2>
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-4" />
          </div>

          {/* Interactive Filter & Search Bar in Indian Currency */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* AC / Non-AC Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-lg">
                <button
                  onClick={() => setAcFilter("ALL")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                    acFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setAcFilter("AC")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    acFilter === "AC"
                      ? "bg-[#F5A623] text-black shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                  AC
                </button>
                <button
                  onClick={() => setAcFilter("NON_AC")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    acFilter === "NON_AC"
                      ? "bg-[#F5A623] text-black shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  Non-AC
                </button>
              </div>

              {/* Bed Capacity Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-[#F5A623]" /> Beds:
                </span>
                <select
                  value={bedFilter}
                  onChange={(e) => setBedFilter(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F5A623] shadow-sm cursor-pointer"
                >
                  <option value="ALL">Any Capacity</option>
                  <option value="1">1 King / Queen (2 Guests)</option>
                  <option value="2">2 Beds (Family 4)</option>
                  <option value="3+">3+ Beds / Villa (5-6 Guests)</option>
                </select>
              </div>

              {/* Price Filter in Indian Rupees */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <span className="text-[#F5A623] font-bold text-sm">₹</span> Price:
                </span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F5A623] shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Rates</option>
                  <option value="UNDER_4000">Eco / Budget (₹2,500 - ₹4,000)</option>
                  <option value="4000_7000">Premium (₹4,000 - ₹7,000)</option>
                  <option value="OVER_7000">Luxury &amp; Villas (₹7,000 - ₹12,000)</option>
                </select>
              </div>

              {/* Keyword Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search room name or facilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F5A623] shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status Counts */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
              <span>
                Showing <strong>{filteredRooms.length}</strong> of {rooms.length} Luxury Rooms &amp; Suites
              </span>
              {(acFilter !== "ALL" || bedFilter !== "ALL" || priceFilter !== "ALL" || searchQuery || destinationQuery) && (
                <button
                  onClick={() => {
                    setAcFilter("ALL");
                    setBedFilter("ALL");
                    setPriceFilter("ALL");
                    setSearchQuery("");
                    setDestinationQuery("");
                  }}
                  className="text-xs text-[#F5A623] hover:underline font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Rooms Cards Grid - 100% Guaranteed Visible without blank screen */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <p className="text-lg font-semibold text-slate-700">
                No rooms match your active filter criteria.
              </p>
              <button
                onClick={() => {
                  setAcFilter("ALL");
                  setBedFilter("ALL");
                  setPriceFilter("ALL");
                  setSearchQuery("");
                  setDestinationQuery("");
                }}
                className="px-6 py-2 bg-[#F5A623] text-black font-bold text-xs uppercase rounded cursor-pointer"
              >
                Clear Filters (Show All {rooms.length} Rooms)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} allRooms={rooms} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 3. ABOUT RESORT / LUXURY EXPERIENCE STORY SECTION */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" /> Five-Star Hospitality
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Welcome To A Haven Of Refinement &amp; Peace
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Nestled on pristine shores, our resort hotel pairs exquisite architecture with attentive, personalized service. Each room and suite has been crafted with premium linens, soundproofing, and ensuite bath facilities with sanitized bathrooms and rainfall showers.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">24/7 Butler Care</h4>
                  <p className="text-xs text-slate-500">Dedicated staff ready around the clock.</p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Hygiene Certified</h4>
                  <p className="text-xs text-slate-500">Daily multi-point sanitization protocol.</p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleOpenBookingPopup(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A623] hover:bg-[#e0961b] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Book With Concierge (WhatsApp)
                </button>
              </div>
            </div>

            {/* Visual Collage using live suite photos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-slate-200">
                <Image
                  src={rooms[0]?.coverImage?.secureUrl || "/images/rooms/deluxe_bedroom.jpg"}
                  alt={rooms[0]?.name || "Luxury Suite"}
                  fill
                  unoptimized
                  quality={100}
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-slate-200 mt-8">
                <Image
                  src={rooms[1]?.coverImage?.secureUrl || "/images/rooms/family_villa.jpg"}
                  alt={rooms[1]?.name || "Executive Suite"}
                  fill
                  unoptimized
                  quality={100}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 4. RESORT FACILITIES & AMENITIES GRID */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900">
              Resort Amenities &amp; Privileges
            </h2>
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-[#F5A623] rounded-full flex items-center justify-center mx-auto">
                <Waves className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Oceanfront Infinity Pool</h4>
              <p className="text-xs text-slate-500">Heated temperature control with private cabanas.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-[#F5A623] rounded-full flex items-center justify-center mx-auto">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Gourmet Breakfast</h4>
              <p className="text-xs text-slate-500">Farm-to-table artisan buffet and fresh bakery.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-[#F5A623] rounded-full flex items-center justify-center mx-auto">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Fiber High-Speed WiFi</h4>
              <p className="text-xs text-slate-500">Gigabit coverage across suites and gardens.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-[#F5A623] rounded-full flex items-center justify-center mx-auto">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Fine Dining Pavilion</h4>
              <p className="text-xs text-slate-500">World-class chefs preparing local seafood delicacies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Booking Button */}
      {settings.whatsappNumber && (
        <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => handleOpenBookingPopup(null)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">WhatsApp Concierge</span>
          </button>
        </aside>
      )}

      {/* Search & Booking Box Modal (Opens when clicking BOOK NOW in Hero) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#14161F] border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Find the right place to stay
                </h3>
                <p className="text-xs text-slate-400">
                  Select your room preferences, dates &amp; guests
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Row: Two Radio buttons for AC and Non AC */}
            <div className="flex items-center gap-5 sm:gap-6 pt-1">
              <button
                type="button"
                onClick={() => setAcFilter("AC")}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    acFilter === "AC"
                      ? "border-[#F5A623] bg-[#F5A623]/20"
                      : "border-slate-500 group-hover:border-slate-300"
                  }`}
                >
                  {acFilter === "AC" && (
                    <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold tracking-wide transition-colors ${
                    acFilter === "AC" ? "text-[#F5A623]" : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  AC
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAcFilter("NON_AC")}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    acFilter === "NON_AC"
                      ? "border-[#F5A623] bg-[#F5A623]/20"
                      : "border-slate-500 group-hover:border-slate-300"
                  }`}
                >
                  {acFilter === "NON_AC" && (
                    <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold tracking-wide transition-colors ${
                    acFilter === "NON_AC" ? "text-[#F5A623]" : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  Non AC
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAcFilter("ALL")}
                className="flex items-center gap-2 cursor-pointer group ml-auto"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    acFilter === "ALL"
                      ? "border-[#F5A623] bg-[#F5A623]/20"
                      : "border-slate-600 group-hover:border-slate-300"
                  }`}
                >
                  {acFilter === "ALL" && (
                    <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    acFilter === "ALL" ? "text-white font-bold" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  All Rooms
                </span>
              </button>
            </div>

            {/* Box 1: Where to? with Near Me button */}
            <div className="space-y-1">
              <div className="p-3 bg-[#181B26] border border-slate-700/80 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MapPin className="w-5 h-5 text-[#F5A623] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-400 leading-tight">
                      Where to?
                    </label>
                    <input
                      type="text"
                      value={destinationQuery}
                      onChange={(e) => setDestinationQuery(e.target.value)}
                      placeholder="Cox's Bazar, Marine Drive..."
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNearMe}
                  className="px-3 py-1.5 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" /> Near Me
                </button>
              </div>

              <p className="text-[11px] text-sky-400 font-medium pl-1">
                *Find what&apos;s around you by enabling location
              </p>
            </div>

            {/* Box 2: Check-in & Check-out Date */}
            <div className="relative">
              <div
                onClick={() => setDatePickerOpen(!datePickerOpen)}
                className="p-3 bg-[#181B26] border border-slate-700/80 rounded-xl flex items-center gap-3.5 cursor-pointer hover:border-slate-500 transition-all"
              >
                <Calendar className="w-5 h-5 text-[#F5A623] shrink-0" />
                <div className="flex-1">
                  <span className="block text-[11px] font-semibold text-slate-400 leading-tight">
                    Check-in &amp; Check-out Date
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-white pt-0.5">
                    {formatDisplayDates(checkInDate, checkOutDate)}
                  </div>
                </div>
              </div>

              {datePickerOpen && (
                <div className="mt-2 p-3 bg-[#1A1D2A] border border-slate-700 rounded-xl grid grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={getTodayDateString()}
                      onChange={(e) => {
                        const chosen = e.target.value;
                        if (!chosen || isPastDate(chosen)) return;
                        setCheckInDate(chosen);
                        if (checkOutDate <= chosen) {
                          setCheckOutDate(getTomorrowDateString(chosen));
                        }
                      }}
                      className="w-full bg-[#14161F] border border-slate-700 rounded-lg p-2 text-white text-xs font-bold focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={getTomorrowDateString(checkInDate)}
                      onChange={(e) => {
                        const chosen = e.target.value;
                        if (!chosen || chosen <= checkInDate) {
                          setCheckOutDate(getTomorrowDateString(checkInDate));
                        } else {
                          setCheckOutDate(chosen);
                        }
                        setDatePickerOpen(false);
                      }}
                      className="w-full bg-[#14161F] border border-slate-700 rounded-lg p-2 text-white text-xs font-bold focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Box 3: No. of Guests & Rooms (Opens GuestsRoomsModal) */}
            <div
              onClick={() => setGuestsModalOpen(true)}
              className="p-3 bg-[#181B26] border border-slate-700/80 rounded-xl flex items-center gap-3.5 cursor-pointer hover:border-[#F5A623] transition-all"
            >
              <Users className="w-5 h-5 text-[#F5A623] shrink-0" />
              <div className="flex-1">
                <span className="block text-[11px] font-semibold text-slate-400 leading-tight">
                  No. of Guests &amp; Rooms
                </span>
                <div className="text-xs sm:text-sm font-bold text-white pt-0.5">
                  {guestsSummaryText}
                </div>
              </div>
            </div>

            {/* Action Buttons: View Rooms (Filters & Scrolls) & Instant Book Now */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchModalOpen(false);
                  handleSearch();
                }}
                className="py-3.5 bg-[#F5A623] hover:bg-[#e0961b] active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" /> View Rooms
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchModalOpen(false);
                  handleOpenBookingPopup(null);
                }}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Book Directly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guests & Rooms Configuration Modal (Matching Screenshot 2 & 3) */}
      <GuestsRoomsModal
        isOpen={guestsModalOpen}
        onClose={() => setGuestsModalOpen(false)}
        initialRooms={roomConfigs}
        onApply={(updatedRooms) => {
          setRoomConfigs(updatedRooms);
        }}
      />

      {/* Universal Booking Form Popup */}
      {bookingPopupOpen && (
        <BookingPopupModal
          isOpen={bookingPopupOpen}
          onClose={() => setBookingPopupOpen(false)}
          selectedRoom={bookingPopupRoom}
          allRooms={rooms}
        />
      )}
    </div>
  );
}
