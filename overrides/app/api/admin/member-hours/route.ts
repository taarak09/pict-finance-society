import { NextResponse } from "next/server";
import { requireCoordinator } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { getMemberHoursReport } from "./report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireCoordinator();
    const report = await getMemberHoursReport();
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
