
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const businessType = searchParams.get("businessType") || "";
    const location = (searchParams.get("location") || "").trim();

    const requestedPage = Number(searchParams.get("page") || 1);
    const page = Number.isInteger(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const allowedTypes = [
      "MANUFACTURER",
      "WHOLESALER",
      "DISTRIBUTOR",
      "RETAILER",
      "EXPORTER",
      "IMPORTER",
    ];

    if (businessType && !allowedTypes.includes(businessType)) {
      return NextResponse.json(
        { success: false, message: "Invalid business type." },
        { status: 400 }
      );
    }

    const where = { status: "APPROVED" };

    if (search) {
      where.companyName = { contains: search };
    }

    if (businessType) {
      where.businessType = businessType;
    }

    if (location) {
      where.OR = [
        { city: { contains: location } },
        { state: { contains: location } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        select: {
          id: true,
          userId: true,
          companyName: true,
          businessType: true,
          description: true,
          city: true,
          state: true,
          website: true,
          isVerified: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),

      prisma.supplierProfile.count({ where }),
    ]);

    const supplierIds = suppliers.map((supplier) => supplier.userId);

    const productCounts = supplierIds.length
      ? await prisma.product.groupBy({
          by: ["sellerId"],
          where: {
            sellerId: { in: supplierIds },
            status: "ACTIVE",
          },
          _count: { id: true },
        })
      : [];

    const countMap = Object.fromEntries(
      productCounts.map((item) => [item.sellerId, item._count.id])
    );

    const results = suppliers.map((supplier) => ({
      ...supplier,
      activeProductCount: countMap[supplier.userId] || 0,
    }));

    return NextResponse.json({
      success: true,
      suppliers: results,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("Suppliers API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load suppliers." },
      { status: 500 }
    );
  }
}
