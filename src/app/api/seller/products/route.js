
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cleanProductImageUrls } from "@/lib/product-images";

async function getSeller() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "UNAUTHORIZED" };

  if (session.user.role !== "SELLER") {
    return { error: "FORBIDDEN" };
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
  });

if (!supplier) return { error: "NO_PROFILE" };

if (supplier.status !== "APPROVED") {
  return { error: "SELLER_NOT_APPROVED" };
}

  return { userId: session.user.id, supplier };
}

function responseForAuthError(error) {
  const status = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NO_PROFILE: 403,
  }[error];

  const message = {
    UNAUTHORIZED: "Please login first.",
    FORBIDDEN: "Seller access required.",
    NO_PROFILE: "Complete your seller business profile first.",
  }[error];

  return NextResponse.json({ success: false, message }, { status });
}


export async function GET() {
  try {
    const seller = await getSeller();

    if (seller.error) return responseForAuthError(seller.error);

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.userId },
        include: {
          category: true,
          images: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      supplier: seller.supplier,
      categories,
      products: products.map((product) => ({
        ...product,
        price: product.price?.toString() ?? "",
      })),
    });
  } catch (error) {
    console.error("Seller products GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load seller products." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const seller = await getSeller();

    if (seller.error) return responseForAuthError(seller.error);

    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const unit = String(body.unit || "").trim();
    const categoryId = Number(body.categoryId);
    const minimumOrderQty = Number(body.minimumOrderQty || 1);
    const priceInput = body.price === "" || body.price == null
      ? null
      : Number(body.price);

    if (!name || name.length > 180) {
      return NextResponse.json(
        { success: false, message: "Enter a product name (maximum 180 characters)." },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, message: "Enter a product description." },
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
        { success: false, message: "Minimum order quantity must be at least 1." },
        { status: 400 }
      );
    }

    if (
      priceInput !== null &&
      (!Number.isFinite(priceInput) || priceInput < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid product price." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Selected category does not exist." },
        { status: 400 }
      );
    }

    const baseSlug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    const slug = `${baseSlug}-${Date.now()}`;

    const imageUrls = cleanProductImageUrls(body.imageUrls);

    const product = await prisma.product.create({
      data: {
        sellerId: seller.userId,
        categoryId,
        name,
        slug,
        description,
        price: priceInput,
        unit: unit || null,
        minimumOrderQty,
        status: "DRAFT",
        images: {
          create: imageUrls.map((imageUrl) => ({ imageUrl })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product saved as draft.",
      product: {
        ...product,
        price: product.price?.toString() ?? "",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Seller products POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create product." },
      { status: 500 }
    );
  }
}
