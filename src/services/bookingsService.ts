import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, BookingStatus } from "@/types";

const BOOKINGS_COLLECTION = "bookings";
const BLOCKS_COLLECTION = "availabilityBlocks";

export async function checkRoomAvailability(
  roomId: string,
  totalInventory: number,
  checkIn: string,
  checkOut: string,
  requestedQuantity: number = 1
): Promise<{ isAvailable: boolean; remainingInventory: number }> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where("roomId", "==", roomId));
    const snapshot = await getDocs(q);

    let bookedQuantity = 0;
    const reqStart = new Date(checkIn).getTime();
    const reqEnd = new Date(checkOut).getTime();

    snapshot.forEach((docSnap) => {
      const b = docSnap.data() as Booking;
      // Only count CONFIRMED or PENDING bookings
      if (b.status === "CONFIRMED" || b.status === "PENDING") {
        const bStart = new Date(b.checkIn).getTime();
        const bEnd = new Date(b.checkOut).getTime();

        // Standard overlap condition: start < reqEnd && end > reqStart
        if (bStart < reqEnd && bEnd > reqStart) {
          bookedQuantity += b.roomQuantity || 1;
        }
      }
    });

    // Check availability blocks (maintenance, private blocks)
    let blockedQuantity = 0;
    try {
      const blocksRef = collection(db, BLOCKS_COLLECTION);
      const bq = query(blocksRef, where("roomId", "==", roomId), where("status", "==", "ACTIVE"));
      const blockSnap = await getDocs(bq);
      blockSnap.forEach((docSnap) => {
        const block = docSnap.data();
        const blkStart = new Date(block.startDate).getTime();
        const blkEnd = new Date(block.endDate).getTime();
        if (blkStart < reqEnd && blkEnd > reqStart) {
          blockedQuantity += block.quantity || 1;
        }
      });
    } catch (e) {
      console.warn("Could not query availability blocks:", e);
    }

    const remaining = totalInventory - bookedQuantity - blockedQuantity;
    return {
      isAvailable: remaining >= requestedQuantity,
      remainingInventory: Math.max(0, remaining),
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { isAvailable: true, remainingInventory: totalInventory };
  }
}

export async function createBookingRecord(
  bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
): Promise<{ id: string; bookingId: string }> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const now = new Date().toISOString();

  const docRef = await addDoc(bookingsRef, {
    ...bookingData,
    createdAt: now,
    updatedAt: now,
  });

  return { id: docRef.id, bookingId: bookingData.bookingId };
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const bookings: Booking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...(docSnap.data() as Omit<Booking, "id">) });
    });

    // Sort descending by creation
    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting user bookings:", error);
    return [];
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const snapshot = await getDocs(bookingsRef);

    const bookings: Booking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...(docSnap.data() as Omit<Booking, "id">) });
    });

    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return [];
  }
}

export async function getBookingById(bookingIdOrDocId: string): Promise<Booking | null> {
  try {
    // Try document ID first
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingIdOrDocId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Booking, "id">) };
    }

    // Try bookingId field (e.g. BK-XXXXXX)
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where("bookingId", "==", bookingIdOrDocId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...(d.data() as Omit<Booking, "id">) };
    }

    return null;
  } catch (error) {
    console.error("Error getting booking:", error);
    return null;
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  adminNote?: string
): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  const updatePayload: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (adminNote !== undefined) {
    updatePayload.adminNote = adminNote;
  }
  if (status === "CONFIRMED") {
    updatePayload.confirmedAt = new Date().toISOString();
  } else if (status === "CANCELLED" || status === "REJECTED") {
    updatePayload.cancelledAt = new Date().toISOString();
  } else if (status === "COMPLETED") {
    updatePayload.completedAt = new Date().toISOString();
  }

  await updateDoc(docRef, updatePayload);
}
