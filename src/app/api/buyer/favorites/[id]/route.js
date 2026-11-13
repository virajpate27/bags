import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "BUYER") {
      return NextResponse.json(
        { success: false, message: "Buyer access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const favoriteId = Number(id);

    if (!Number.isSafeInteger(favoriteId) || favoriteId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid favourite ID." },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!favorite) {
      return NextResponse.json(
        { success: false, message: "Favourite not found." },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({
      success: true,
      message: "Product removed from favourites.",
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove favourite." },
      { status: 500 }
    );
  }
}
