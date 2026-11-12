
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Supplier ID is required." },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplierProfile.findFirst({
      where: {
        id,
        status: "APPROVED",
      },
      select: {
        id: true,
        companyName: true,
        businessType: true,
        description: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        website: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: "Supplier not found." },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        sellerId: supplier.user.id,
        status: "ACTIVE",
      },
      include: {
        category: true,
        images: {
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 24,
    });

    return NextResponse.json({
      success: true,
      supplier,
      products: products.map((product) => ({
        ...product,
        price: product.price?.toString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Supplier profile API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load supplier profile." },
      { status: 500 }
    );
  }
}
