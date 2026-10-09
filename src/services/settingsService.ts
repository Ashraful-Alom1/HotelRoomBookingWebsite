import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { HotelSettings } from "@/types";

const SETTINGS_DOC_ID = "hotel_profile";

export const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  hotelName: "Grand Horizon Luxury Suites & Resort",
  tagline: "Experience unmatched luxury, serene coastal comfort & bespoke hospitality",
  description: "Nestled in an idyllic haven, Grand Horizon offers world-class accommodations, exquisite dining, private balconies with panoramic vistas, and personalized 24/7 concierge services.",
  phone: "+91 8822308551",
  email: "reservations@grandhorizonhotel.com",
  whatsappNumber: "+918822308551",
  address: "Luxury Beachfront Boulevard, India",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  cancellationPolicy: "Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to a one-night fee.",
  bookingPolicy: "Valid government-issued photo ID required at check-in. Minimum check-in age is 18.",
  currency: "INR",
  timezone: "Asia/Kolkata",
  taxRatePercent: 12,
  updatedAt: new Date().toISOString(),
};

export async function getHotelSettings(): Promise<HotelSettings> {
  try {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as HotelSettings;
    }
    return DEFAULT_HOTEL_SETTINGS;
  } catch (error) {
    console.error("Error getting hotel settings:", error);
    return DEFAULT_HOTEL_SETTINGS;
  }
}

export async function updateHotelSettings(settings: Partial<HotelSettings>): Promise<void> {
  const docRef = doc(db, "settings", SETTINGS_DOC_ID);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
