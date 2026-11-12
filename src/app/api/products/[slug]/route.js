
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid product URL." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: "ACTIVE",
        seller: {
          supplierProfile: {
            is: {
              status: "APPROVED",
            },
          },
        },
      },
      include: {
        category: true,
        images: true,
        seller: {
          select: {
            id: true,
            name: true,
            supplierProfile: {
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
                status: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        categoryId: product.categoryId,
        id: { not: product.id },
        seller: {
          supplierProfile: {
            is: {
              status: "APPROVED",
            },
          },
        },
      },
      include: {
        category: true,
        images: { take: 1 },
        seller: {
          select: {
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
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        price: product.price?.toString() ?? null,
      },
      relatedProducts: relatedProducts.map((item) => ({
        ...item,
        price: item.price?.toString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Product details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load product details.",
      },
      { status: 500 }
    );
  }
}
