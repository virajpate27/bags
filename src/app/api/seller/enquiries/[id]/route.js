
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const allowedStatuses = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "CLOSED",
];

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please log in." },
        { status: 401 }
      );
    }

    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        supplierProfile: {
          select: { status: true },
        },
      },
    });

    if (!seller || seller.role !== "SELLER") {
      return NextResponse.json(
        { message: "Seller access required." },
        { status: 403 }
      );
    }

    if (seller.supplierProfile?.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Your seller account is awaiting admin approval." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid enquiry status." },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.findFirst({
      where: {
        id,
        sellerId: seller.id,
      },
      select: { id: true },
    });

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Enquiry status updated.",
      enquiry: updated,
    });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json(
      { message: "Unable to update enquiry." },
      { status: 500 }
    );
  }
}
