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
import { Review, ReviewStatus } from "@/types";

const REVIEWS_COLLECTION = "reviews";
const ROOMS_COLLECTION = "rooms";

export async function getApprovedReviews(roomId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where("roomId", "==", roomId),
      where("status", "==", "APPROVED")
    );
    const snapshot = await getDocs(q);

    const reviews: Review[] = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...(docSnap.data() as Omit<Review, "id">) });
    });

    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching approved reviews:", error);
    return [];
  }
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const snapshot = await getDocs(reviewsRef);

    const reviews: Review[] = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...(docSnap.data() as Omit<Review, "id">) });
    });

    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting all reviews:", error);
    return [];
  }
}

export async function submitReview(
  reviewData: Omit<Review, "id" | "createdAt" | "updatedAt" | "status">
): Promise<string> {
  const reviewsRef = collection(db, REVIEWS_COLLECTION);
  const now = new Date().toISOString();

  const docRef = await addDoc(reviewsRef, {
    ...reviewData,
    status: "PENDING" as ReviewStatus,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function moderateReview(
  reviewId: string,
  status: ReviewStatus,
  adminUserId?: string
): Promise<void> {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (!reviewSnap.exists()) {
    throw new Error("Review not found");
  }

  const reviewData = reviewSnap.data() as Review;
  const now = new Date().toISOString();

  await updateDoc(reviewRef, {
    status,
    updatedAt: now,
    moderatedAt: now,
    moderatedBy: adminUserId || "ADMIN",
  });

  // Re-calculate room average rating and review count
  await recalculateRoomRating(reviewData.roomId);
}

export async function recalculateRoomRating(roomId: string): Promise<void> {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where("roomId", "==", roomId),
      where("status", "==", "APPROVED")
    );
    const snapshot = await getDocs(q);

    let totalRating = 0;
    let count = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Review;
      totalRating += data.rating;
      count += 1;
    });

    const averageRating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 5.0;

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      averageRating,
      reviewCount: count,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recalculating room rating:", error);
  }
}
