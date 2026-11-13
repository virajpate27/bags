
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdmin, adminError } from "@/lib/admin";

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

    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      pendingSellers,
      approvedSellers,
      totalProducts,
      activeProducts,
      draftProducts,
      totalCategories,
      recentUsers,
      sellerApplications,
      pendingProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.supplierProfile.count({ where: { status: "PENDING" } }),
      prisma.supplierProfile.count({ where: { status: "APPROVED" } }),
      prisma.product.count(),
      prisma.product.count({
        where: {
          status: "ACTIVE",
          seller: {
            supplierProfile: {
              is: {
                status: "APPROVED",
              },
            },
          },
        },
      }),
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.category.count(),

      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      prisma.supplierProfile.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),

      prisma.product.findMany({
        where: { status: "DRAFT" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          category: { select: { id: true, name: true } },
          seller: {
            select: {
              id: true,
              name: true,
              supplierProfile: {
                select: { companyName: true, status: true },
              },
            },
          },
          images: { take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellers,
        approvedSellers,
        totalProducts,
        activeProducts,
        draftProducts,
        totalCategories,
      },
      recentUsers,
      sellerApplications,
      pendingProducts,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { message: "Unable to load admin dashboard." },
      { status: 500 }
    );
  }
}
