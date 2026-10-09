"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRooms, RoomFilters as FilterType } from "@/services/roomsService";
import { Room } from "@/types";
import RoomCard from "@/components/room/RoomCard";
import RoomFilters from "@/components/room/RoomFilters";
import { Sparkles, Bed, Loader2 } from "lucide-react";

function RoomsContent() {
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from query params
  const [filters, setFilters] = useState<FilterType>({
    category: searchParams.get("category") || "ALL",
    isAC: searchParams.get("isAC") !== null ? searchParams.get("isAC") === "true" : undefined,
    minPrice: undefined,
    maxPrice: 600,
    guests: searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : undefined,
    sortBy: "price_asc",
  });

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const data = await getRooms(filters);
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold uppercase tracking-widest border border-[#D4AF37]/30">
          <Sparkles className="w-3.5 h-3.5" /> Accommodations Directory
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Our Luxury Rooms & Suites
        </h1>
        <p className="text-sm text-slate-400">
          Filter by climate control (AC vs Non-AC), guest capacity, nightly rate, or suite type. All rooms are synchronized with real-time reservation inventory.
        </p>
      </div>

      {/* Main Grid: Filters + Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 sticky top-28">
          <RoomFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Room List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
            <span>
              Showing <strong className="text-white">{rooms.length}</strong> available suite{rooms.length !== 1 ? "s" : ""}
            </span>
            <span>Live Firestore Inventory</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
              <Bed className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-xl font-bold text-white">No suites match your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your price range, clearing the AC/Non-AC filter, or reducing the requested guest capacity.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    category: "ALL",
                    isAC: undefined,
                    minPrice: undefined,
                    maxPrice: 600,
                    guests: undefined,
                    sortBy: "price_asc",
                  })
                }
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  );
}
