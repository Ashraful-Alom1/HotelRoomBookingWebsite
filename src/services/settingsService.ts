import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { HotelSettings } from "@/types";

const SETTINGS_DOC_ID = "hotel_profile";
export const SETTINGS_STORAGE_KEY = "hotel_settings_v1";

export const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  hotelName: "Grand Horizon",
  tagline: "Experience unmatched luxury, serene coastal comfort & bespoke hospitality",
  description: "An iconic coastal retreat delivering exceptional hospitality, refined architectural luxury, and private sanctuary accommodations.",
  phone: "+880 1833-075594",
  email: "reservations@grandhorizon.com",
  whatsappNumber: "+8801833075594",
  address: "Marine Drive Road, Cox's Bazar 4700, Bangladesh",
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",
  cancellationPolicy: "Free 48h Cancellation Policy",
  bookingPolicy: "Valid government-issued photo ID required at check-in. Minimum check-in age is 18.",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  taxRatePercent: 0,
  copyrightText: "Grand Horizon Luxury Suites. All rights reserved.",
  updatedAt: new Date().toISOString(),
};

export async function getHotelSettings(): Promise<HotelSettings> {
  // 1. Try local cache first for instant synchronous render
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // We will return merged cache, and then optionally refresh in background
        return { ...DEFAULT_HOTEL_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn("Error reading local settings cache:", e);
    }
  }

  // 2. Fetch latest from Firestore
  try {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { ...DEFAULT_HOTEL_SETTINGS, ...(snap.data() as HotelSettings) };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
      return data;
    }
  } catch (error) {
    console.warn("Firestore settings read failed, using fallback:", error);
  }

  return DEFAULT_HOTEL_SETTINGS;
}

export async function updateHotelSettings(settings: Partial<HotelSettings>): Promise<void> {
  const updatedData: HotelSettings = {
    ...DEFAULT_HOTEL_SETTINGS,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Instantly persist to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedData));
      // Notify all listening components across tabs & windows
      window.dispatchEvent(new Event("hotel-settings-updated"));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    await setDoc(docRef, updatedData, { merge: true });
  } catch (error) {
    console.error("Firestore settings save error (saved locally):", error);
    // Even if firestore has network latency, local state was safely persisted
  }
}
