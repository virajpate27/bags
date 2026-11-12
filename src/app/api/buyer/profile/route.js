
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    if (session.user.role !== "BUYER") {
      return NextResponse.json(
        { success: false, message: "Buyer access required." },
        { status: 403 }
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
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
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
