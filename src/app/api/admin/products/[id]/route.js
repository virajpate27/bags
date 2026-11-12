
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

    if (!["ACTIVE", "INACTIVE", "DRAFT"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid product status." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            supplierProfile: {
              select: { status: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    // Products can only be activated for approved sellers.
    if (
      status === "ACTIVE" &&
      product.seller.supplierProfile?.status !== "APPROVED"
    ) {
      return NextResponse.json(
        { message: "Approve the seller before activating products." },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Product status updated successfully.",
      product: updated,
    });
  } catch (error) {
    console.error("Product moderation error:", error);
    return NextResponse.json(
      { message: "Unable to update product." },
      { status: 500 }
    );
  }
}
