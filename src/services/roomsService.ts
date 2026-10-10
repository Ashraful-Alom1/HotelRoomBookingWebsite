import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Room } from "@/types";
import { INITIAL_ROOMS_DATA } from "./seedService";

const ROOMS_COLLECTION = "rooms";

// In-memory initial rooms cache with IDs
export const FALLBACK_ROOMS: Room[] = INITIAL_ROOMS_DATA.map((r, i) => ({
  ...r,
  id: `suite-${r.slug}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export interface RoomFilters {
  category?: string;
  isAC?: boolean;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "popular";
}

export async function getRooms(filters?: RoomFilters): Promise<Room[]> {
  let rooms: Room[] = [];

  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const fetchPromise = getDocs(roomsRef);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), 1500)
    );
    const snapshot = (await Promise.race([fetchPromise, timeoutPromise])) as any;

    if (snapshot && snapshot.forEach) {
      snapshot.forEach((docSnap: any) => {
        rooms.push({ id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) });
      });
    }
  } catch (error) {
    console.warn("Firestore read returned error or timed out (using authoritative suites):", error);
  }

  // If Firestore is empty or contains legacy data lacking complete local images, locations, or updated rates, use the authoritative local image dataset
  if (
    rooms.length === 0 ||
    rooms.some(
      (r) =>
        !r.gallery ||
        r.gallery.length < 3 ||
        !r.toiletImages ||
        r.toiletImages.length < 2 ||
        !r.washroomImages ||
        r.washroomImages.length < 1 ||
        !r.location ||
        r.pricePerNight < 2000
    )
  ) {
    rooms = [...FALLBACK_ROOMS];
  }

  // Dynamic filtering
  if (filters) {
    if (filters.category && filters.category !== "ALL") {
      rooms = rooms.filter(
        (r) =>
          r.categoryName.toLowerCase() === filters.category?.toLowerCase() ||
          r.categoryId.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    if (filters.isAC !== undefined) {
      rooms = rooms.filter((r) => r.isAC === filters.isAC);
    }
    if (filters.minPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight <= filters.maxPrice!);
    }
    if (filters.guests !== undefined && filters.guests > 0) {
      rooms = rooms.filter((r) => r.maxGuests >= filters.guests!);
    }

    // Sorting
    if (filters.sortBy === "price_asc") {
      rooms.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (filters.sortBy === "price_desc") {
      rooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (filters.sortBy === "rating") {
      rooms.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (filters.sortBy === "popular") {
      rooms.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
  }

  return rooms;
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const match = FALLBACK_ROOMS.find((r) => r.slug === slug || r.id === slug);
  if (match) return match;

  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) };
    }

    const byIdDoc = await getDoc(doc(db, ROOMS_COLLECTION, slug));
    if (byIdDoc.exists()) {
      return { id: byIdDoc.id, ...(byIdDoc.data() as Omit<Room, "id">) };
    }
  } catch (error) {
    console.warn("Firestore query error for slug:", error);
  }

  return null;
}

export async function getRoomById(id: string): Promise<Room | null> {
  const match = FALLBACK_ROOMS.find((r) => r.id === id || r.slug === id);
  if (match) return match;

  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) };
    }
  } catch (error) {
    console.warn("Firestore getDoc error for id:", error);
  }

  return null;
}

export async function createRoom(roomData: Omit<Room, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  const now = new Date().toISOString();
  const docRef = await addDoc(roomsRef, {
    ...roomData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateRoom(id: string, roomData: Partial<Room>): Promise<void> {
  const docRef = doc(db, ROOMS_COLLECTION, id);
  await updateDoc(docRef, {
    ...roomData,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteRoom(id: string): Promise<void> {
  const docRef = doc(db, ROOMS_COLLECTION, id);
  await deleteDoc(docRef);
}
