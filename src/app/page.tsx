"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRooms } from "@/services/roomsService";
import { Room } from "@/types";
import RoomCard from "@/components/room/RoomCard";
import BookingPopupModal from "@/components/booking/BookingPopupModal";
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
} from "lucide-react";

const HERO_SLIDES = [
  {
    image: "/images/rooms/Okura-Nikko-Top-hero-2026-autumn-4.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "World-class hospitality, tranquil suites & bespoke seaside comfort",
  },
  {
    image: "/images/rooms/HotelRoom.jpg",
    title: "Enjoy A Luxury Experience",
    subtitle: "Step into modern elegance with breathtaking panoramic views",
  },
  {
    image: "/images/rooms/luxury-bedroom-suite-resort-high-rise-hotel-with-working-table_105762-1783.avif",
    title: "Enjoy A Luxury Experience",
    subtitle: "Indulge in five-star architecture and private jacuzzi suites",
  },
];

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Quick Availability Widget State
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [guestCount, setGuestCount] = useState("2");

  // Filter States
  const [acFilter, setAcFilter] = useState<"ALL" | "AC" | "NON_AC">("ALL");
  const [bedFilter, setBedFilter] = useState<"ALL" | "1" | "2" | "3+">("ALL");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "UNDER_2000" | "2000_5000" | "OVER_5000">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Universal Booking Popup State
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);
  const [bookingPopupRoom, setBookingPopupRoom] = useState<Room | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Automatic hero slider cycle every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Filter Logic with smooth reactive filtering in Indian Currency
  const filteredRooms = rooms.filter((room) => {
    // AC filter
    if (acFilter === "AC" && !room.isAC) return false;
    if (acFilter === "NON_AC" && room.isAC) return false;

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
    if (priceFilter === "UNDER_2000" && room.pricePerNight >= 2000) return false;
    if (priceFilter === "2000_5000" && (room.pricePerNight < 2000 || room.pricePerNight > 5000)) return false;
    if (priceFilter === "OVER_5000" && room.pricePerNight <= 5000) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchCategory = room.categoryName.toLowerCase().includes(q);
      const matchBed = room.bedType.toLowerCase().includes(q);
      const matchAmenity = room.amenities?.some((a) => a.toLowerCase().includes(q));
      if (!matchName && !matchCategory && !matchBed && !matchAmenity) return false;
    }

    return true;
  });

  const whatsappPhone = "8822308551";

  const handleOpenBookingPopup = (specificRoom?: Room | null) => {
    setBookingPopupRoom(specificRoom || (rooms.length > 0 ? rooms[0] : null));
    setBookingPopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. HERO SECTION (EXACT MATCH WITH SCREENSHOT) */}
      <section className="relative h-[85vh] sm:h-[90vh] w-full overflow-hidden flex items-center justify-center bg-slate-950">
        {/* Background Images with smooth fade transition */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt="Luxury Resort Experience"
              fill
              priority={index === 0}
              unoptimized
              quality={100}
              className="object-cover brightness-75 scale-100 transition-transform duration-7000 ease-linear"
            />
            {/* Subtle dark gradient overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Left Slider Arrow Button (Exact golden button from screenshot) */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 sm:left-8 z-20 w-11 h-11 bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 flex items-center justify-center transition-all shadow-lg rounded cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Hero Content (Exact typography and button from screenshot) */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-normal text-white drop-shadow-md tracking-normal leading-tight">
            Enjoy A Luxury <br />
            Experience
          </h1>

          <div>
            <button
              onClick={() => handleOpenBookingPopup(null)}
              className="inline-block bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 font-black text-sm uppercase px-8 py-3.5 tracking-wider transition-all shadow-xl rounded cursor-pointer"
            >
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Right Slider Arrow Button (Exact golden button from screenshot) */}
        <button
          onClick={handleNextSlide}
          className="absolute right-4 sm:right-8 z-20 w-11 h-11 bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 flex items-center justify-center transition-all shadow-lg rounded cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 stroke-[3]" />
        </button>
      </section>

      {/* 2. LUXURY QUICK AVAILABILITY BAR */}
      <section className="relative z-30 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Check-In */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#F5A623]" /> Check-In
              </label>
              <input
                type="date"
                value={checkInDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-Out */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#F5A623]" /> Check-Out
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-[#F5A623]" /> Guests
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="1">1 Person (Single)</option>
                <option value="2">2 Persons (Couple)</option>
                <option value="3">3 Persons</option>
                <option value="4">4 Persons (Family)</option>
                <option value="5">5+ Persons (Villa)</option>
              </select>
            </div>

            {/* Find Suites / Book Now Button */}
            <button
              onClick={() => handleOpenBookingPopup(null)}
              className="w-full h-full min-h-[52px] bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" /> Book Room Now
            </button>
          </div>
        </div>
      </section>

      {/* 3. "OUR MOST POPULAR ROOMS" SECTION (EXACT MATCH WITH SCREENSHOT) */}
      <section id="popular-rooms" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading (Matching screenshot) */}
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
                  <option value="UNDER_2000">Budget (Under ₹2,000)</option>
                  <option value="2000_5000">Premium (₹2,000 - ₹5,000)</option>
                  <option value="OVER_5000">Ultra Luxury (₹5,000+)</option>
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
                Showing <strong>{filteredRooms.length}</strong> of {rooms.length} Luxury Rooms & Suites
              </span>
              {(acFilter !== "ALL" || bedFilter !== "ALL" || priceFilter !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setAcFilter("ALL");
                    setBedFilter("ALL");
                    setPriceFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-xs text-[#F5A623] hover:underline font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Rooms Cards Grid (Exact screenshot layout with allRooms passed) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 animate-pulse h-96 rounded-none" />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
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
                }}
                className="px-6 py-2 bg-[#F5A623] text-black font-bold text-xs uppercase rounded cursor-pointer"
              >
                Clear Filters
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

      {/* 4. ABOUT RESORT / LUXURY EXPERIENCE STORY SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" /> Five-Star Hospitality
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Welcome To A Haven Of Refinement & Peace
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

            {/* Visual Collage using user uploaded images in full HD */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-slate-200">
                <Image
                  src="/images/rooms/embracing-opulence-in-a-hotel-room-with-a-large-window-generative-ai-photo.jpg"
                  alt="Luxury Hotel Room with View"
                  fill
                  unoptimized
                  quality={100}
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-slate-200 mt-8">
                <Image
                  src="/images/rooms/deluxe_bedroom.jpg"
                  alt="Deluxe Executive Bedroom"
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

      {/* 5. RESORT FACILITIES & AMENITIES GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900">
              World-Class Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Everything you need for an unforgettable vacation, romantic weekend, or executive retreat.
            </p>
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Waves, name: "Infinity Pool", desc: "Temperature controlled" },
              { icon: Utensils, name: "Fine Dining", desc: "Gourmet local cuisine" },
              { icon: Wifi, name: "Fiber WiFi", desc: "Ultra-fast connection" },
              { icon: Coffee, name: "Morning Breakfast", desc: "Buffet & à la carte" },
              { icon: Tv, name: "4K Entertainment", desc: "Smart OLED TVs" },
              { icon: ShieldCheck, name: "Private Security", desc: "24/7 Gated grounds" },
            ].map((facility, i) => (
              <div
                key={i}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-2 hover:border-[#F5A623] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-[#F5A623] mx-auto flex items-center justify-center group-hover:bg-[#F5A623] group-hover:text-black transition-colors">
                  <facility.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">{facility.name}</h4>
                <p className="text-[11px] text-slate-500">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHATSAPP DIRECT BOOKING CALLOUT BANNER */}
      <section className="bg-slate-900 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs uppercase font-bold tracking-widest text-[#F5A623]">
                Instant Concierge Service
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                Book Directly via WhatsApp: 8822308551
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Have specific dates or room inquiries? Chat live with our front desk reservations team for fast booking confirmation, custom requests, and special rates.
              </p>
            </div>

            <button
              onClick={() => handleOpenBookingPopup(null)}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              Chat & Reserve On WhatsApp (8822308551)
            </button>
          </div>
        </div>
      </section>

      {/* 7. FLOATING WHATSAPP BUTTON (ALWAYS ACCESSIBLE TO USER) */}
      <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenBookingPopup(null)}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp 8822308551</span>
        </button>
      </aside>

      {/* Universal Booking Popup Modal */}
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
