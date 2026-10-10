"use client";

import React, { useState } from "react";
import { X, Minus, Plus } from "lucide-react";

export interface RoomConfig {
  id: number;
  adults: number;
  children: number;
  childrenAges: number[];
  isEditing?: boolean;
}

interface GuestsRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rooms: RoomConfig[], totalGuests: number) => void;
  initialRooms?: RoomConfig[];
}

export default function GuestsRoomsModal({
  isOpen,
  onClose,
  onApply,
  initialRooms,
}: GuestsRoomsModalProps) {
  const [rooms, setRooms] = useState<RoomConfig[]>(
    initialRooms && initialRooms.length > 0
      ? initialRooms
      : [{ id: 1, adults: 2, children: 0, childrenAges: [], isEditing: true }]
  );

  React.useEffect(() => {
    if (isOpen && initialRooms && initialRooms.length > 0) {
      setRooms(initialRooms);
    }
  }, [isOpen, initialRooms]);

  if (!isOpen) return null;

  const handleAdultChange = (roomId: number, delta: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const next = Math.max(1, Math.min(6, r.adults + delta));
        return { ...r, adults: next };
      })
    );
  };

  const handleChildrenChange = (roomId: number, delta: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const next = Math.max(0, Math.min(4, r.children + delta));
        let ages = [...r.childrenAges];
        if (next > ages.length) {
          while (ages.length < next) ages.push(2);
        } else if (next < ages.length) {
          ages = ages.slice(0, next);
        }
        return { ...r, children: next, childrenAges: ages };
      })
    );
  };

  const handleChildAgeChange = (roomId: number, childIndex: number, age: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const ages = [...r.childrenAges];
        ages[childIndex] = age;
        return { ...r, childrenAges: ages };
      })
    );
  };

  const handleAddRoom = () => {
    if (rooms.length >= 4) return;
    const nextId = (rooms[rooms.length - 1]?.id || 0) + 1;
    // Mark previous rooms as collapsed/summary
    setRooms((prev) => [
      ...prev.map((r) => ({ ...r, isEditing: false })),
      { id: nextId, adults: 2, children: 0, childrenAges: [], isEditing: true },
    ]);
  };

  const handleRemoveRoom = (roomId: number) => {
    if (rooms.length <= 1) return;
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const handleToggleEdit = (roomId: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isEditing: !r.isEditing } : r))
    );
  };

  const handleDone = () => {
    const totalGuests = rooms.reduce((acc, r) => acc + r.adults + r.children, 0);
    onApply(rooms, totalGuests);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-[#14161D] text-white rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header (Exact match with Screenshot) */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-[#161822]">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#F5A623] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Select No.of Guests & Rooms
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {rooms.map((roomItem, index) => {
            const isEditing = roomItem.isEditing !== false;

            return (
              <div
                key={roomItem.id}
                className="space-y-4 pb-5 border-b border-white/10 last:border-b-0"
              >
                {/* Room Title Row */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">Room {index + 1}</h3>

                  {!isEditing && (
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <button
                        onClick={() => handleToggleEdit(roomItem.id)}
                        className="text-sky-400 hover:text-sky-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      {rooms.length > 1 && (
                        <button
                          onClick={() => handleRemoveRoom(roomItem.id)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsed Summary View (Screenshot 3 style) */}
                {!isEditing ? (
                  <p className="text-xs text-slate-300">
                    {roomItem.adults} Adults
                    {roomItem.children > 0 ? ` , ${roomItem.children} child` : ""}
                  </p>
                ) : (
                  /* Expanded Controls View (Screenshot 2 style) */
                  <div className="space-y-4 pt-1">
                    {/* Adults Stepper */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          Adult(s) (Age above 12 yrs)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAdultChange(roomItem.id, -1)}
                          disabled={roomItem.adults <= 1}
                          className="w-8 h-8 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/20 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-white">
                          {roomItem.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdultChange(roomItem.id, 1)}
                          disabled={roomItem.adults >= 6}
                          className="w-8 h-8 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/20 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Children Stepper */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          Children (Age 2 to 12 yrs)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(roomItem.id, -1)}
                          disabled={roomItem.children <= 0}
                          className="w-8 h-8 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/20 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-white">
                          {roomItem.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(roomItem.id, 1)}
                          disabled={roomItem.children >= 4}
                          className="w-8 h-8 rounded-full border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/20 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Children Ages dropdowns if children > 0 (Exact Screenshot 2 Match) */}
                    {roomItem.children > 0 && (
                      <div className="pt-2 space-y-3">
                        <div className="text-xs font-bold text-white">
                          Children age at check - in
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Children age will be used to find you the best match in beds, rooms,
                          size and special prices
                        </p>

                        <div className="space-y-2.5 pt-1">
                          {roomItem.childrenAges.map((age, childIdx) => (
                            <div key={childIdx} className="relative">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Child {childIdx + 1} Age
                              </label>
                              <select
                                value={age}
                                onChange={(e) =>
                                  handleChildAgeChange(
                                    roomItem.id,
                                    childIdx,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full bg-[#181B26] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#F5A623] cursor-pointer"
                              >
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                                  <option key={a} value={a}>
                                    {a} Years
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Another Room Button */}
          {rooms.length < 4 && (
            <button
              type="button"
              onClick={handleAddRoom}
              className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              + Add Another Room
            </button>
          )}
        </div>

        {/* Bottom Actions Bar (Exact Screenshot Match: Cancel & Done) */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#161822] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="flex-1 py-3 rounded-xl bg-[#F5A623] hover:bg-[#e0961b] active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
