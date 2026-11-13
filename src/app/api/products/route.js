
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Read query parameters
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const location = (searchParams.get("location") || "").trim();

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const sort = searchParams.get("sort") || "latest";

    const requestedPage = Number(searchParams.get("page") || 1);

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    // 2. Validate price filters
    if (
      (minPrice !== null &&
        (minPrice.trim() === "" ||
          !Number.isFinite(Number(minPrice)) ||
          Number(minPrice) < 0)) ||
      (maxPrice !== null &&
        (maxPrice.trim() === "" ||
          !Number.isFinite(Number(maxPrice)) ||
          Number(maxPrice) < 0)) ||
      (minPrice !== null &&
        maxPrice !== null &&
        Number(minPrice) > Number(maxPrice))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid price range.",
        },
        { status: 400 }
      );
    }

    // 3. Validate sorting
    const allowedSortOptions = [
      "latest",
      "price-low",
      "price-high",
      "name",
    ];

    const selectedSort = allowedSortOptions.includes(sort)
      ? sort
      : "latest";

    // 4. Build Prisma filters
    const supplierProfileFilter = {
      status: "APPROVED",
    };

    if (location) {
      supplierProfileFilter.OR = [
        {
          city: {
            contains: location,
          },
        },
        {
          state: {
            contains: location,
          },
        },
      ];
    }

    const where = {
      status: "ACTIVE",
      seller: {
        supplierProfile: {
          is: supplierProfileFilter,
        },
      },
    };

    // Keyword search
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Location filtering is combined with the approved-supplier condition above.

    // Price filter
    if (minPrice !== null || maxPrice !== null) {
      const priceFilter = {};

      if (minPrice !== null) {
        priceFilter.gte = minPrice;
      }

      if (maxPrice !== null) {
        priceFilter.lte = maxPrice;
      }

      where.price = priceFilter;
    }

    // 5. Sorting
    let orderBy = {
      createdAt: "desc",
    };

    if (selectedSort === "price-low") {
      orderBy = {
        price: "asc",
      };
    } else if (selectedSort === "price-high") {
      orderBy = {
        price: "desc",
      };
    } else if (selectedSort === "name") {
      orderBy = {
        name: "asc",
      };
    }

    // 6. Fetch products, count and categories
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,

        include: {
          category: true,

          images: {
            take: 1,
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
                  isVerified: true,
                },
              },
            },
          },
        },

        orderBy,

        skip: (page - 1) * PAGE_SIZE,

        take: PAGE_SIZE,
      }),

      prisma.product.count({
        where,
      }),

      prisma.category.findMany({
        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    // 7. Convert Prisma Decimal values to JSON-safe strings
    const formattedProducts = products.map((product) => ({
      ...product,

      price: product.price
        ? product.price.toString()
        : null,
    }));

    // 8. Return API response
    return NextResponse.json({
      success: true,

      products: formattedProducts,

      categories,

      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
        hasNextPage: page < Math.ceil(total / PAGE_SIZE),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("TradeBridge Products API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load products. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
