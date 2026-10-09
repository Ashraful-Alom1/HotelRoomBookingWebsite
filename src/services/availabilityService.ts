import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AvailabilityBlock } from "@/types";

const BLOCKS_COLLECTION = "availabilityBlocks";

export async function getAvailabilityBlocks(roomId?: string): Promise<AvailabilityBlock[]> {
  try {
    const blocksRef = collection(db, BLOCKS_COLLECTION);
    let q = query(blocksRef);
    if (roomId) {
      q = query(blocksRef, where("roomId", "==", roomId));
    }
    const snap = await getDocs(q);
    const blocks: AvailabilityBlock[] = [];
    snap.forEach((docSnap) => {
      blocks.push({ id: docSnap.id, ...(docSnap.data() as Omit<AvailabilityBlock, "id">) });
    });
    return blocks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching availability blocks:", error);
    return [];
  }
}

export async function createAvailabilityBlock(
  data: Omit<AvailabilityBlock, "id" | "createdAt">
): Promise<string> {
  const blocksRef = collection(db, BLOCKS_COLLECTION);
  const docRef = await addDoc(blocksRef, {
    ...data,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function releaseAvailabilityBlock(blockId: string): Promise<void> {
  const docRef = doc(db, BLOCKS_COLLECTION, blockId);
  await updateDoc(docRef, {
    status: "RELEASED",
  });
}
