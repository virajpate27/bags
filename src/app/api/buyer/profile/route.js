import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, getAuthorizationError } from "@/lib/permissions";

export async function PATCH(request) {
  try {
    const access = await requireRole("BUYER");

    if (access.error) {
      const error = getAuthorizationError(access.error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Enter a valid name." },
        { status: 400 }
      );
    }

    if (phone.length > 20) {
      return NextResponse.json(
        { success: false, message: "Phone number is too long." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: access.user.id },
      data: { name, phone: phone || null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Buyer profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update profile." },
      { status: 500 }
    );
  }
}
