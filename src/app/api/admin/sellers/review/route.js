import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdmin, adminError } from "@/lib/admin";

export async function POST(request) {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const body = await request.json();
    const profileId = body.profileId;
    const decision = body.decision;

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
      select: { id: true, status: true },
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
