
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdmin, adminError } from "@/lib/admin";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Category fetch error:", error);
    return NextResponse.json(
      { message: "Unable to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();

    if (!name || name.length > 100) {
      return NextResponse.json(
        { message: "Enter a category name (maximum 100 characters)." },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid category name." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "This category already exists." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(
      { message: "Category created successfully.", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { message: "Unable to create category." },
      { status: 500 }
    );
  }
}
