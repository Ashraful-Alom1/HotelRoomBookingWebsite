import { NextResponse } from "next/server";
import { seedInitialDatabaseIfNeeded } from "@/services/seedService";

export async function GET() {
  try {
    const result = await seedInitialDatabaseIfNeeded();
    return NextResponse.json({
      success: true,
      seeded: result.seeded,
      count: result.count,
      message: result.seeded
        ? `Successfully seeded ${result.count} luxury rooms into Firestore.`
        : `Database already contains ${result.count} rooms.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
