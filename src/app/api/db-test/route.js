
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [users, categories, products] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: "TradeBridge MySQL connected successfully!",
      database: "Hostinger MySQL",
      data: {
        users,
        categories,
        products,
      },
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
