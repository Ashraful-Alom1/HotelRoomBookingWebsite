"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Room } from "@/types";
import { Clock, Star, Snowflake, Wind } from "lucide-react";
import RoomViewModal from "./RoomViewModal";

interface RoomCardProps {
  room: Room;
  allRooms?: Room[];
}

export default function RoomCard({ room, allRooms = [] }: RoomCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Cover image from public images
  const imageUrl =
    room.coverImage?.secureUrl ||
    room.gallery?.[0]?.secureUrl ||
    "/images/rooms/HotelRoom.jpg";

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group overflow-hidden">
        {/* Top Image Container with Yellow Indian Rupee Price Badge */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
        >
          <Image
            src={imageUrl}
            alt={room.coverImage?.altText || room.name}
            fill
            unoptimized
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Yellow Price Badge in Top-Right Corner with Indian Currency */}
          <div className="absolute top-0 right-0 bg-[#F5A623] text-slate-950 font-black text-base px-3.5 py-1.5 shadow-md z-10">
            ₹{room.pricePerNight.toLocaleString("en-IN")}
          </div>

          {/* AC / Non-AC Pill in Top-Left Corner */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {room.isAC ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-black/60 text-sky-300 backdrop-blur-sm border border-sky-400/30">
                <Snowflake className="w-3 h-3 text-sky-400" /> AC
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-black/60 text-emerald-300 backdrop-blur-sm border border-emerald-400/30">
                <Wind className="w-3 h-3 text-emerald-400" /> Non-AC
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between bg-white text-slate-900 space-y-4">
          <div className="space-y-2">
            {/* Room Title (Serif bold, matching screenshot) */}
            <h3
              onClick={() => setModalOpen(true)}
              className="font-serif-luxury text-xl font-bold text-slate-900 hover:text-[#F5A623] cursor-pointer transition-colors"
            >
              {room.name}
            </h3>

            {/* 5 Golden Stars (Exact match with screenshot) */}
            <div className="flex items-center gap-0.5 text-[#F5A623]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F5A623]" />
              ))}
            </div>

            {/* Subtle bed capacity indicator */}
            <p className="text-xs text-slate-500 pt-1 line-clamp-1 font-medium">
              {room.bedType} • Max {room.maxGuests} Guests
            </p>
          </div>

          {/* Bottom Row: Clock + "7 days 6 nights" & Yellow "LEARN MORE" Button (Exact match with screenshot) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>7 days 6 nights</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-white font-extrabold text-xs uppercase px-4 py-2 transition-all shadow-sm rounded-none tracking-wider cursor-pointer"
            >
              LEARN MORE
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <RoomViewModal
          room={room}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          allRooms={allRooms}
        />
      )}
    </>
  );
}
