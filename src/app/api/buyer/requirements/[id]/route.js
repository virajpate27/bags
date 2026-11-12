
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Please log in." }, { status: 401 });
    }

    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!buyer || buyer.role !== "BUYER") {
      return NextResponse.json({ message: "Buyer access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!["OPEN", "CLOSED"].includes(body.status)) {
      return NextResponse.json(
        { message: "Invalid requirement status." },
        { status: 400 }
      );
    }

    const requirement = await prisma.requirement.findFirst({
      where: { id, buyerId: buyer.id },
      select: { id: true },
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Requirement not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.requirement.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({
      message: "Requirement updated successfully.",
      requirement: updated,
    });
  } catch (error) {
    console.error("Requirement update error:", error);
    return NextResponse.json(
      { message: "Unable to update requirement." },
      { status: 500 }
    );
  }
}
