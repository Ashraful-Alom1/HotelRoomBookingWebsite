import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Room } from "@/types";
import { INITIAL_ROOMS_DATA } from "./seedService";

const ROOMS_COLLECTION = "rooms";
const LOCAL_STORAGE_KEY = "GRAND_HORIZON_ROOMS_CATALOG_V2";

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
export let FALLBACK_ROOMS: Room[] = INITIAL_ROOMS_DATA.map((r, i) => ({
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
      setTimeout(() => reject(new Error("Firestore timeout")), 4000)
    );
    const snapshot = (await Promise.race([fetchPromise, timeoutPromise])) as any;

    if (snapshot && snapshot.forEach) {
      snapshot.forEach((docSnap: any) => {
        rooms.push({ id: docSnap.id, ...(docSnap.data() as Omit<Room, "id">) });
      });
    }
  } catch (error) {
    console.warn("Firestore read returned error or timed out:", error);
  }

  // If Firestore returned rooms, save to localStorage and update in-memory cache
  if (rooms.length > 0) {
    FALLBACK_ROOMS = rooms;
    persistStoredRooms(rooms);
  } else {
    // If Firestore has no documents yet or threw permission error, read from localStorage
    const stored = getStoredRooms();
    if (stored && stored.length > 0) {
      rooms = stored;
      FALLBACK_ROOMS = stored;
    } else {
      // Default to initial curated suites and save to localStorage
      rooms = [...FALLBACK_ROOMS];
      persistStoredRooms(rooms);
    }
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
  const now = new Date().toISOString();
  const slug = roomData.slug || `suite-${Date.now()}`;
  const newId = slug.startsWith("suite-") ? slug : `suite-${slug}`;

  const newRoom: Room = {
    ...roomData,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Immediately save to in-memory cache and localStorage so it's instantly available client-side & admin-side
  FALLBACK_ROOMS = [newRoom, ...FALLBACK_ROOMS.filter((r) => r.id !== newId)];
  persistStoredRooms(FALLBACK_ROOMS);

  // 2. Attempt Firestore Cloud write
  try {
    const docRef = doc(db, ROOMS_COLLECTION, newId);
    await setDoc(docRef, {
      ...roomData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error: any) {
    console.warn("Firestore setDoc write warning:", error?.code, error?.message);
    if (error?.code === "permission-denied") {
      console.warn("Firestore Security Rules blocked write. Please update Firebase Console Rules to 'allow read, write: if true;'. Suite was saved locally in your browser.");
    }
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

  // 2. Attempt Firestore Cloud write
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    await setDoc(
      docRef,
      {
        ...roomData,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error: any) {
    console.warn("Firestore setDoc update warning:", error?.code, error?.message);
  }
}

export async function deleteRoom(id: string): Promise<void> {
  FALLBACK_ROOMS = FALLBACK_ROOMS.filter((r) => r.id !== id && r.slug !== id);
  persistStoredRooms(FALLBACK_ROOMS);

  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore deleteDoc error:", error);
  }
}

