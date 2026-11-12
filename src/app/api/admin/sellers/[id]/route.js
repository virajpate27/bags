
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdmin, adminError } from "@/lib/admin";

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid seller status." },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Seller profile not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.supplierProfile.update({
      where: { id },
      data: {
        status,
        isVerified: status === "APPROVED",
      },
    });

    return NextResponse.json({
      message: `Seller ${status.toLowerCase()} successfully.`,
      supplier: updated,
    });
  } catch (error) {
    console.error("Seller moderation error:", error);
    return NextResponse.json(
      { message: "Unable to update seller." },
      { status: 500 }
    );
  }
}
