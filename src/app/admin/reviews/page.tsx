"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, moderateReview } from "@/services/reviewsService";
import { getRooms } from "@/services/roomsService";
import { Review, Room } from "@/types";
import { formatDate } from "@/lib/utils";
import { Star, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const loadData = async () => {
    try {
      const [revData, roomData] = await Promise.all([getAllReviews(), getRooms()]);
      setReviews(revData);
      setRooms(roomData);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModerate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await moderateReview(id, status);
      await loadData();
    } catch (err) {
      console.error("Error moderating review:", err);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Reputation & QA
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Review Moderation Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Approve or reject customer reviews. Approving a review automatically updates the room&apos;s dynamic average star rating in the database.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 text-xs">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition-all ${
              filter === tab
                ? "gold-gradient-bg text-black shadow-md"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {tab} ({reviews.filter((r) => (tab === "ALL" ? true : r.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((rev) => {
            const roomMatch = rooms.find((r) => r.id === rev.roomId);

            return (
              <div
                key={rev.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.customerName}</span>
                      <span className="text-slate-400">• {formatDate(rev.createdAt)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rev.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : rev.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-[#D4AF37] font-semibold mt-0.5">
                      Suite: {roomMatch?.name || rev.roomId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModerate(rev.id, "APPROVED")}
                      disabled={rev.status === "APPROVED"}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleModerate(rev.id, "REJECTED")}
                      disabled={rev.status === "REJECTED"}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 disabled:opacity-40 text-red-300 font-bold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {Array.from({ length: rev.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                    <span className="ml-1 text-white font-bold">{rev.rating} / 5</span>
                  </div>

                  {rev.title && <h3 className="font-bold text-white text-sm">{rev.title}</h3>}
                  <p className="text-slate-300 leading-relaxed text-sm bg-white/5 p-3 rounded-xl">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            No reviews found for this status.
          </div>
        )}
      </div>
    </div>
  );
}
