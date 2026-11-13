import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;
const SORT_OPTIONS = ["latest", "price-low", "price-high", "name"];

function parseOptionalPrice(value) {
  if (value === null || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : NaN;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const location = (searchParams.get("location") || "").trim();
    const verifiedOnly = searchParams.get("verified") === "1";
    const minPrice = parseOptionalPrice(searchParams.get("minPrice"));
    const maxPrice = parseOptionalPrice(searchParams.get("maxPrice"));
    const sortParam = searchParams.get("sort") || "latest";
    const sort = SORT_OPTIONS.includes(sortParam) ? sortParam : "latest";
    const requestedPage = Number(searchParams.get("page") || 1);

    if (
      Number.isNaN(minPrice) ||
      Number.isNaN(maxPrice) ||
      (minPrice !== null && maxPrice !== null && minPrice > maxPrice)
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid price range." },
        { status: 400 }
      );
    }

    const and = [];
    if (q) {
      and.push({
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { category: { name: { contains: q } } },
          {
            seller: {
              supplierProfile: {
                is: { companyName: { contains: q } },
              },
            },
          },
        ],
      });
    }
    if (category) and.push({ category: { slug: category } });
    if (location) {
      and.push({
        seller: {
          supplierProfile: {
            is: {
              OR: [
                { city: { contains: location } },
                { state: { contains: location } },
              ],
            },
          },
        },
      });
    }
    if (verifiedOnly) {
      and.push({ seller: { supplierProfile: { is: { isVerified: true } } } });
    }
    if (minPrice !== null || maxPrice !== null) {
      const price = {};
      if (minPrice !== null) price.gte = minPrice;
      if (maxPrice !== null) price.lte = maxPrice;
      and.push({ price });
    }

    const where = {
      status: "ACTIVE",
      seller: { supplierProfile: { is: { status: "APPROVED" } } },
      ...(and.length ? { AND: and } : {}),
    };

    const orderBy = {
      latest: { updatedAt: "desc" },
      "price-low": { price: "asc" },
      "price-high": { price: "desc" },
      name: { name: "asc" },
    }[sort];

    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, Math.max(totalPages, 1))
      : 1;

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { take: 1 },
          seller: {
            select: {
              id: true,
              name: true,
              supplierProfile: {
                select: {
                  companyName: true,
                  city: true,
                  state: true,
                  isVerified: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    const safeProducts = products.map((product) => ({
      ...product,
      price: product.price === null ? null : product.price.toString(),
    }));

    return NextResponse.json({
      success: true,
      products: safeProducts,
      categories,
      filters: { q, category, location, minPrice, maxPrice, verifiedOnly, sort },
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("TradeBridge Products API Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load products. Please try again." },
      { status: 500 }
    );
  }
}
