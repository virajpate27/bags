
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const { profileId, decision } = await request.json();

    if (
      typeof profileId !== "string" ||
      !["APPROVED", "REJECTED"].includes(decision)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid review request." },
        { status: 400 }
      );
    }

    const profile = await prisma.supplierProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Pending seller profile not found." },
        { status: 404 }
      );
    }

    await prisma.supplierProfile.update({
      where: { id: profileId },
      data: {
        status: decision,
        isVerified: decision === "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Seller ${decision.toLowerCase()} successfully.`,
    });
  } catch (error) {
    console.error("Seller review error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to review seller." },
      { status: 500 }
    );
  }
}
