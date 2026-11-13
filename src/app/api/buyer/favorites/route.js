import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getBuyer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "UNAUTHENTICATED" };
  }

  // Always verify the role from the database, not the session's additional field.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user) return { error: "UNAUTHENTICATED" };
  if (user.role !== "BUYER") return { error: "BUYER_REQUIRED" };

  return { user };
}

function authError(error) {
  if (error === "UNAUTHENTICATED") {
    return NextResponse.json(
      { success: false, message: "Please log in as a buyer to save products." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { success: false, message: "Only buyer accounts can save products." },
    { status: 403 }
  );
}

function readProductId(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function findPublicProduct(productId) {
  return prisma.product.findFirst({
    where: {
      id: productId,
      status: "ACTIVE",
      seller: {
        supplierProfile: {
          is: { status: "APPROVED" },
        },
      },
    },
    select: { id: true },
  });
}

// GET /api/buyer/favorites?productId=PRODUCT_ID
// Used by the save button to determine whether this product is already saved.
export async function GET(request) {
  try {
    const productId = readProductId(
      new URL(request.url).searchParams.get("productId")
    );

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const access = await getBuyer();

    if (access.error === "UNAUTHENTICATED") {
      return NextResponse.json({
        success: true,
        authenticated: false,
        canSave: false,
        isFavorite: false,
      });
    }

    if (access.error) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        canSave: false,
        isFavorite: false,
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: access.user.id,
          productId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      canSave: true,
      isFavorite: Boolean(favorite),
      favoriteId: favorite?.id ?? null,
    });
  } catch (error) {
    console.error("Get favourite status error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to check saved product status." },
      { status: 500 }
    );
  }
}

// POST /api/buyer/favorites - save a product for the logged-in buyer.
export async function POST(request) {
  try {
    const access = await getBuyer();
    if (access.error) return authError(access.error);

    const body = await request.json();
    const productId = readProductId(body?.productId);

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await findPublicProduct(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "This product is not currently available." },
        { status: 404 }
      );
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: access.user.id,
          productId,
        },
      },
      create: {
        userId: access.user.id,
        productId,
      },
      update: {},
      select: { id: true, productId: true },
    });

    return NextResponse.json({
      success: true,
      isFavorite: true,
      favorite,
      message: "Product added to saved products.",
    });
  } catch (error) {
    console.error("Add favourite error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save this product." },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/favorites?productId=PRODUCT_ID - unsave a product.
export async function DELETE(request) {
  try {
    const access = await getBuyer();
    if (access.error) return authError(access.error);

    const productId = readProductId(
      new URL(request.url).searchParams.get("productId")
    );

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const result = await prisma.favorite.deleteMany({
      where: {
        userId: access.user.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: false,
      message: result.count
        ? "Product removed from saved products."
        : "Product was not in your saved products.",
    });
  } catch (error) {
    console.error("Remove favourite error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to remove this product." },
      { status: 500 }
    );
  }
}
