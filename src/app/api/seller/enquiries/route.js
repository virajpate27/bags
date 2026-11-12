
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
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

    const enquiries = await prisma.enquiry.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1 },
          },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Seller enquiries error:", error);
    return NextResponse.json(
      { message: "Unable to load seller enquiries." },
      { status: 500 }
    );
  }
}
