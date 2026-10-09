"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllReviews } from "@/services/reviewsService";
import { Review } from "@/types";
import { formatDate } from "@/lib/utils";
import { Star, ShieldCheck, Sparkles, MessageSquare, ArrowRight, Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getAllReviews();
        // Publicly display APPROVED reviews
        setReviews(all.filter((r) => r.status === "APPROVED"));
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Header Banner */}
      <div className="glass-panel-gold rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 text-center space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
          Guest Testimonials
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Verified Guest Reviews
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Every review presented here is authenticated from confirmed guest stays and reflects our dedication to exemplary hospitality.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-1.5 text-2xl font-extrabold text-white">
            <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
            <span>{avgRating}</span>
          </div>
          <span className="text-slate-400 text-xs">
            Based on {totalReviews} approved guest evaluation{totalReviews !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-[#D4AF37]/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {Array.from({ length: rev.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>

                {rev.title && <h3 className="text-base font-bold text-white">{rev.title}</h3>}
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{rev.customerName}</p>
                  <p className="text-[10px] text-slate-400">Grand Horizon Guest</p>
                </div>
                {rev.isVerifiedStay && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Verified Stay
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-sm">
          No reviews available yet. Check back soon!
        </div>
      )}

      {/* CTA Bottom Banner */}
      <div className="text-center pt-8">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
        >
          <span>Explore Suites & Book Your Stay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
