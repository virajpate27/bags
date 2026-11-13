import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireApprovedSeller,
  getAuthorizationError,
} from "@/lib/permissions";

function authorizationResponse(error) {
  const result = getAuthorizationError(error);
  return NextResponse.json(
    { success: false, message: result.message },
    { status: result.status }
  );
}

function cleanImageUrls(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((url) => typeof url === "string")
      .map((url) => url.trim())
      .filter((url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      })
  )].slice(0, 8);
}

export async function PATCH(request, { params }) {
  try {
    const seller = await requireApprovedSeller();
    if (seller.error) return authorizationResponse(seller.error);

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findFirst({
      where: { id, sellerId: seller.user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const unit = String(body.unit || "").trim();
    const categoryId = Number(body.categoryId);
    const minimumOrderQty = Number(body.minimumOrderQty || 1);
    const priceInput = body.price === "" || body.price == null
      ? null
      : Number(body.price);

    if (!name || name.length > 180 || !description) {
      return NextResponse.json(
        { success: false, message: "Enter a valid product name and description." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Select a valid category." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(minimumOrderQty) || minimumOrderQty < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid minimum order quantity." },
        { status: 400 }
      );
    }

    if (priceInput !== null && (!Number.isFinite(priceInput) || priceInput < 0)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid price." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Selected category does not exist." },
        { status: 400 }
      );
    }

    const imageUrls = cleanImageUrls(body.imageUrls);

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          name,
          description,
          categoryId,
          price: priceInput,
          unit: unit || null,
          minimumOrderQty,
          images: {
            create: imageUrls.map((imageUrl) => ({ imageUrl })),
          },
        },
        include: { category: true, images: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: {
        ...product,
        price: product.price?.toString() ?? "",
      },
    });
  } catch (error) {
    console.error("Seller product PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const seller = await requireApprovedSeller();
    if (seller.error) return authorizationResponse(seller.error);

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, sellerId: seller.user.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Seller product DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete product." },
      { status: 500 }
    );
  }
}
