
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

    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!buyer || buyer.role !== "BUYER") {
      return NextResponse.json(
        { message: "Buyer access required." },
        { status: 403 }
      );
    }

    const enquiries = await prisma.enquiry.findMany({
      where: { buyerId: buyer.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1 },
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            supplierProfile: {
              select: {
                companyName: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Buyer enquiries error:", error);
    return NextResponse.json(
      { message: "Unable to load enquiries." },
      { status: 500 }
    );
  }
}
