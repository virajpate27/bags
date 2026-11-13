import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getAuthorizationError } from "@/lib/permissions";

export async function GET() {
  try {
    const access = await requireRole("BUYER");

    if (access.error) {
      const error = getAuthorizationError(access.error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const userId = access.user.id;

    const [
      user,
      enquiryCount,
      requirementCount,
      favoriteCount,
      enquiries,
      requirements,
      favorites,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.enquiry.count({ where: { buyerId: userId } }),
      prisma.requirement.count({ where: { buyerId: userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.enquiry.findMany({
        where: { buyerId: userId },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          seller: {
            select: {
              name: true,
              supplierProfile: { select: { companyName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.requirement.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.favorite.findMany({
        where: { userId },
        include: {
          product: {
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
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Buyer account not found." },
        { status: 404 }
      );
    }

    const formattedFavorites = favorites.map((favorite) => ({
      ...favorite,
      product: favorite.product
        ? {
            ...favorite.product,
            price: favorite.product.price?.toString() ?? null,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      user,
      stats: {
        enquiries: enquiryCount,
        requirements: requirementCount,
        favorites: favoriteCount,
      },
      enquiries,
      requirements,
      favorites: formattedFavorites,
    });
  } catch (error) {
    console.error("Buyer dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load buyer dashboard." },
      { status: 500 }
    );
  }
}
