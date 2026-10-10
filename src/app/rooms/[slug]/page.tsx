import { getRoomBySlug, getRooms } from "@/services/roomsService";
import { getApprovedReviews } from "@/services/reviewsService";
import RoomDetailClient from "./RoomDetailClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return {
      title: "Suite Not Found | Grand Horizon",
    };
  }

  return {
    title: `${room.name} (${room.isAC ? "AC" : "Non-AC"}) | Grand Horizon Luxury Suites`,
    description: room.shortDescription || room.description,
    openGraph: {
      title: room.name,
      description: room.shortDescription,
      images: [room.coverImage?.secureUrl || ""],
    },
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  const reviews = room ? await getApprovedReviews(room.id) : [];
  const allRooms = await getRooms();
  const otherRooms = room ? allRooms.filter((r) => r.id !== room.id && r.slug !== room.slug) : allRooms;

  return (
    <RoomDetailClient
      room={room}
      initialReviews={reviews}
      similarRooms={otherRooms}
      allRooms={allRooms}
    />
  );
}
