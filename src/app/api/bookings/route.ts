import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, Room } from "@/types";
import { calculateNights } from "@/lib/utils";
import { getRoomById, getRoomBySlug } from "@/services/roomsService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      roomQuantity = 1,
      customerNote = "",
      customer,
      userId = "guest",
    } = body;

    // Basic payload validation
    if (!roomId || !checkIn || !checkOut || !customer?.fullName || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    // 1. Fetch Authoritative Room Data (Never trust client pricing)
    let room = await getRoomById(roomId);
    if (!room) {
      room = await getRoomBySlug(roomId);
    }

    if (!room) {
      return NextResponse.json({ error: "Selected room not found." }, { status: 404 });
    }

    if (room.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This room is currently unavailable for reservations." },
        { status: 400 }
      );
    }

    if (guests > (room.maxGuests * roomQuantity)) {
      return NextResponse.json(
        { error: `Maximum guest capacity exceeded for selected room quantity (${room.maxGuests * roomQuantity} max).` },
        { status: 400 }
      );
    }

    // 2. Server-side Availability & Inventory Check
    let bookedQuantity = 0;
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("roomId", "==", roomId));
      const snapshot = await getDocs(q);

      const reqStart = new Date(checkIn).getTime();
      const reqEnd = new Date(checkOut).getTime();

      snapshot.forEach((docSnap) => {
        const b = docSnap.data() as Booking;
        if (b.status === "CONFIRMED" || b.status === "PENDING") {
          const bStart = new Date(b.checkIn).getTime();
          const bEnd = new Date(b.checkOut).getTime();
          if (bStart < reqEnd && bEnd > reqStart) {
            bookedQuantity += b.roomQuantity || 1;
          }
        }
      });
    } catch (e) {
      console.warn("Could not query overlapping bookings:", e);
    }

    const totalInventory = room.inventoryQuantity || 1;
    const remainingInventory = totalInventory - bookedQuantity;

    if (remainingInventory < roomQuantity) {
      return NextResponse.json(
        {
          error: `Sorry, this room is no longer available for the chosen dates. Only ${Math.max(0, remainingInventory)} room(s) left.`,
        },
        { status: 409 }
      );
    }

    // 3. Server-authoritative Pricing Calculation
    const nightlyPrice = room.pricePerNight;
    const subtotal = nightlyPrice * nights * roomQuantity;
    const taxes = Math.round(subtotal * 0.1); // 10% tax
    const fees = 0;
    const discount = 0;
    const total = subtotal + taxes + fees - discount;

    // 4. Generate Unique Booking ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `BK-${randomSuffix}`;
    const now = new Date().toISOString();

    const newBooking: Omit<Booking, "id"> = {
      bookingId,
      userId,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      roomId,
      roomSnapshot: {
        name: room.name,
        slug: room.slug,
        isAC: room.isAC,
        pricePerNight: nightlyPrice,
        maxGuests: room.maxGuests,
        coverImageUrl: room.coverImage?.secureUrl || "",
      },
      checkIn,
      checkOut,
      nights,
      guests,
      roomQuantity,
      pricing: {
        pricePerNight: nightlyPrice,
        subtotal,
        taxes,
        fees,
        discount,
        total,
        currency: room.currency || "INR",
      },
      status: "PENDING",
      customerNote: customerNote.trim(),
      createdAt: now,
      updatedAt: now,
      whatsapp: {
        status: "PENDING",
      },
    };

    // 5. Save to Firestore
    let savedDocId = bookingId;
    try {
      const bookingsRef = collection(db, "bookings");
      const newDocRef = await addDoc(bookingsRef, newBooking);
      savedDocId = newDocRef.id;
    } catch (firestoreErr) {
      console.warn("Firestore addDoc warning (permissions check):", firestoreErr);
    }

    // 6. Trigger WhatsApp Notification Pipeline
    let whatsappSent = false;
    const hotelRecipientPhone = process.env.WHATSAPP_RECIPIENT_NUMBER || "918822308551";
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const messageText = `🛎️ *NEW BOOKING REQUEST — ${bookingId}*\n\n` +
      `*Guest:* ${customer.fullName}\n` +
      `*Phone:* ${customer.phone}\n` +
      `*Email:* ${customer.email}\n` +
      `*Room:* ${room.name} (${room.isAC ? "AC" : "Non-AC"})\n` +
      `*Quantity:* ${roomQuantity} Room(s)\n` +
      `*Dates:* ${checkIn} to ${checkOut} (${nights} night${nights > 1 ? "s" : ""})\n` +
      `*Guests:* ${guests}\n` +
      `*Total Amount:* ₹${total.toLocaleString("en-IN")} INR\n` +
      `*Status:* PENDING APPROVAL\n` +
      (customerNote ? `*Special Request:* "${customerNote}"\n\n` : "\n") +
      `_Review & Confirm in your Admin Dashboard._`;

    // Try Meta WhatsApp Cloud API if credentials provided
    if (waToken && waPhoneId) {
      try {
        const waResponse = await fetch(
          `https://graph.facebook.com/v19.0/${waPhoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${waToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: hotelRecipientPhone,
              type: "text",
              text: { body: messageText },
            }),
          }
        );
        if (waResponse.ok) {
          whatsappSent = true;
        }
      } catch (waErr) {
        console.error("Meta WhatsApp API error:", waErr);
      }
    }

    // Log notification record to Firestore
    try {
      const notifRef = collection(db, "notificationLogs");
      await addDoc(notifRef, {
        type: "NEW_BOOKING_REQUEST",
        bookingId,
        channel: "WHATSAPP",
        recipient: hotelRecipientPhone,
        provider: waToken ? "META_CLOUD_API" : "DIRECT_WA_DISPATCH",
        status: whatsappSent ? "SUCCESS" : "PENDING",
        attemptCount: 1,
        createdAt: now,
        updatedAt: now,
      });
    } catch (notifErr) {
      console.warn("Could not log notification:", notifErr);
    }

    // Prefilled WhatsApp click-to-chat URL for customer convenience or manual forward
    const encodedMessage = encodeURIComponent(messageText);
    const directWaUrl = `https://wa.me/${hotelRecipientPhone}?text=${encodedMessage}`;

    return NextResponse.json({
      success: true,
      id: savedDocId,
      bookingId,
      status: "PENDING",
      nights,
      pricing: newBooking.pricing,
      whatsappUrl: directWaUrl,
      message: "Booking request received! Hotel staff will verify availability and confirm promptly.",
    });
  } catch (err: any) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while placing your booking." },
      { status: 500 }
    );
  }
}
