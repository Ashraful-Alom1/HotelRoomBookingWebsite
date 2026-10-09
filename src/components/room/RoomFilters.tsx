"use client";

import React from "react";
import { RoomFilters as FilterType } from "@/services/roomsService";
import { SlidersHorizontal, Snowflake, Wind, DollarSign, Users, ArrowUpDown } from "lucide-react";

interface RoomFiltersProps {
  filters: FilterType;
  onChange: (newFilters: FilterType) => void;
  categories?: string[];
}

export default function RoomFilters({ filters, onChange, categories = [] }: RoomFiltersProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
          <span>Refine Selection</span>
        </div>
        <button
          onClick={() =>
            onChange({
              category: "ALL",
              isAC: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              guests: undefined,
              sortBy: "price_asc",
            })
          }
          className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors underline"
        >
          Reset Filters
        </button>
      </div>

      {/* AC / Non-AC Pill Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Climate Control
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChange({ ...filters, isAC: undefined })}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              filters.isAC === undefined
                ? "gold-gradient-bg text-black shadow-md"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            All Rooms
          </button>
          <button
            onClick={() => onChange({ ...filters, isAC: true })}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              filters.isAC === true
                ? "bg-sky-500 text-black shadow-md font-bold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" /> AC Only
          </button>
          <button
            onClick={() => onChange({ ...filters, isAC: false })}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              filters.isAC === false
                ? "bg-emerald-500 text-black shadow-md font-bold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> Non-AC
          </button>
        </div>
      </div>

      {/* Room Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Suite Category
        </label>
        <select
          value={filters.category || "ALL"}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="ALL">All Categories</option>
          <option value="Penthouse Suite">Penthouse Suite</option>
          <option value="Deluxe Suite">Deluxe Suite</option>
          <option value="Heritage Classic">Heritage Classic</option>
          <option value="Family Villa">Family Villa</option>
          <option value="Standard Room">Standard Room</option>
        </select>
      </div>

      {/* Guest Count */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Minimum Guests
        </label>
        <select
          value={filters.guests || ""}
          onChange={(e) =>
            onChange({
              ...filters,
              guests: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">Any Guest Capacity</option>
          <option value="1">1+ Guest</option>
          <option value="2">2+ Guests</option>
          <option value="3">3+ Guests</option>
          <option value="4">4+ Guests</option>
          <option value="5">5+ Guests</option>
        </select>
      </div>

      {/* Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            Max Price / Night
          </span>
          <span className="text-[#D4AF37] font-bold">
            ₹{(filters.maxPrice || 15000).toLocaleString("en-IN")}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="20000"
          step="500"
          value={filters.maxPrice || 20000}
          onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value) })}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>₹1,000</span>
          <span>₹10,000</span>
          <span>₹20,000+</span>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" /> Sort Results By
        </label>
        <select
          value={filters.sortBy || "price_asc"}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Guest Rating (Highest first)</option>
          <option value="popular">Popularity / Review Count</option>
        </select>
      </div>
    </div>
  );
}
