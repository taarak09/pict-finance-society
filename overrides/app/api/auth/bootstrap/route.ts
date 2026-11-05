import { NextResponse } from "next/server";

export const runtime = "nodejs";

// One-time bootstrap is intentionally disabled after the first coordinator was created.
export async function POST() {
  return NextResponse.json(
    { error: "Coordinator setup is disabled. Please sign in." },
    { status: 410 }
  );
}
