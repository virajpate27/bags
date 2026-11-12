
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please log in to send an enquiry." },
        { status: 401 }
      );
    }

    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!buyer || buyer.role !== "BUYER") {
      return NextResponse.json(
        { message: "Only buyers can send enquiries." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const productId = String(body.productId || "").trim();
    const message = String(body.message || "").trim();
    const quantity = body.quantity === "" || body.quantity == null
      ? null
      : Number(body.quantity);

    if (!productId || !message) {
      return NextResponse.json(
        { message: "Product and enquiry message are required." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { message: "Message must be 5000 characters or fewer." },
        { status: 400 }
      );
    }

    if (
      quantity !== null &&
      (!Number.isSafeInteger(quantity) || quantity < 1)
    ) {
      return NextResponse.json(
        { message: "Enter a valid quantity." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "ACTIVE",
        seller: {
          supplierProfile: {
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product is unavailable." },
        { status: 404 }
      );
    }

    if (product.sellerId === buyer.id) {
      return NextResponse.json(
        { message: "You cannot enquire about your own product." },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        buyerId: buyer.id,
        sellerId: product.sellerId,
        productId: product.id,
        message,
        quantity,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        message: "Your enquiry has been sent successfully.",
        enquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create enquiry error:", error);
    return NextResponse.json(
      { message: "Unable to send enquiry." },
      { status: 500 }
    );
  }
}
