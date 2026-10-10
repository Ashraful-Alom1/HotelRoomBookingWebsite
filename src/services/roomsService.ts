import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Room } from "@/types";
import { INITIAL_ROOMS_DATA } from "./seedService";

const ROOMS_COLLECTION = "rooms";
const LOCAL_STORAGE_KEY = "GRAND_HORIZON_ROOMS_CATALOG_V2";

function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

function getStoredRooms(): Room[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Error reading rooms from localStorage:", e);
  }
  return null;
}

function persistStoredRooms(rooms: Room[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn("Error saving rooms to localStorage:", e);
  }
}

// In-memory initial rooms cache with IDs
export let FALLBACK_ROOMS: Room[] = INITIAL_ROOMS_DATA.map((r) => ({
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
    const snapshot = await getDocs(roomsRef);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        rooms.push({ id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) });
      });
    }
  } catch (error) {
    console.warn("Firestore getDocs read warning:", error);
  }

  // If Firestore returned rooms, update in-memory cache and localStorage
  if (rooms.length > 0) {
    FALLBACK_ROOMS = rooms;
    persistStoredRooms(rooms);
  } else {
    // If Firestore is still loading or offline, read stored or default
    const stored = getStoredRooms();
    if (stored && stored.length > 0) {
      rooms = stored;
      FALLBACK_ROOMS = stored;
    } else {
      rooms = [...FALLBACK_ROOMS];
      persistStoredRooms(rooms);
    }
  }

  // Dynamic filtering
  if (filters) {
    if (filters.category && filters.category !== "ALL") {
      rooms = rooms.filter(
        (r) =>
          r.categoryId?.toLowerCase() === filters.category?.toLowerCase() ||
          r.categoryName?.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    if (filters.isAC !== undefined) {
      rooms = rooms.filter((r) => r.isAC === filters.isAC);
    }
    if (filters.minPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight <= (filters.maxPrice ?? Infinity));
    }
    if (filters.guests !== undefined && filters.guests > 0) {
      rooms = rooms.filter((r) => r.maxGuests >= (filters.guests ?? 1));
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          rooms.sort((a, b) => a.pricePerNight - b.pricePerNight);
          break;
        case "price_desc":
          rooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
          break;
        case "rating":
          rooms.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        case "popular":
          rooms.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
      }
    }
  }

  return rooms;
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
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

  const match = FALLBACK_ROOMS.find((r) => r.slug === slug || r.id === slug);
  if (match) return match;

  return null;
}

export async function getRoomById(id: string): Promise<Room | null> {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) };
    }
  } catch (error) {
    console.warn("Firestore getDoc error for id:", error);
  }

  const match = FALLBACK_ROOMS.find((r) => r.id === id || r.slug === id);
  if (match) return match;

  return null;
}

export async function createRoom(roomData: Omit<Room, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const now = new Date().toISOString();
  const slug = roomData.slug || `suite-${Date.now()}`;
  const newId = slug.startsWith("suite-") ? slug : `suite-${slug}`;

  const newRoom: Room = {
    ...roomData,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  const cleanData = sanitizeForFirestore(newRoom);

  // 1. Update cache & localStorage
  FALLBACK_ROOMS = [newRoom, ...FALLBACK_ROOMS.filter((r) => r.id !== newId)];
  persistStoredRooms(FALLBACK_ROOMS);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, ROOMS_COLLECTION, newId);
    await setDoc(docRef, cleanData);
    console.log("Room successfully created in Firestore:", newId);
  } catch (error: any) {
    console.error("Firestore createRoom error:", error);
    throw error;
  }

  return newId;
}

export async function updateRoom(id: string, roomData: Partial<Room>): Promise<void> {
  const now = new Date().toISOString();

  // 1. Update in-memory fallback list and localStorage
  const idx = FALLBACK_ROOMS.findIndex((r) => r.id === id || r.slug === id);
  if (idx !== -1) {
    FALLBACK_ROOMS[idx] = {
      ...FALLBACK_ROOMS[idx],
      ...roomData,
      updatedAt: now,
    };
  }
  persistStoredRooms(FALLBACK_ROOMS);

  // 2. Persist to Firestore with sanitized fields
  try {
    const cleanData = sanitizeForFirestore({
      ...roomData,
      updatedAt: now,
    });
    const docRef = doc(db, ROOMS_COLLECTION, id);
    await setDoc(docRef, cleanData, { merge: true });
    console.log("Room successfully updated in Firestore:", id);
  } catch (error: any) {
    console.error("Firestore updateRoom error:", error);
    throw error;
  }
}

export async function deleteRoom(id: string): Promise<void> {
  FALLBACK_ROOMS = FALLBACK_ROOMS.filter((r) => r.id !== id && r.slug !== id);
  persistStoredRooms(FALLBACK_ROOMS);

  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log("Room successfully deleted in Firestore:", id);
  } catch (error) {
    console.error("Firestore deleteRoom error:", error);
    throw error;
  }
}
