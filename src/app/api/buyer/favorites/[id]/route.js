import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getAuthorizationError } from "@/lib/permissions";

export async function DELETE(request, { params }) {
  try {
    const access = await requireRole("BUYER");

    if (access.error) {
      const error = getAuthorizationError(access.error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
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
        userId: access.user.id,
      },
      select: { id: true },
    });

    if (!favorite) {
      return NextResponse.json(
        { success: false, message: "Favourite not found." },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({ where: { id: favoriteId } });

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
