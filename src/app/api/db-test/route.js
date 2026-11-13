import { NextResponse } from "next/server";

/**
 * The public database diagnostic endpoint has been disabled.
 * Do not expose database connectivity details or record counts publicly.
 */
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Not found." },
    { status: 404 }
  );
}
