import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Please log in." }, { status: 401 });
    const buyer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ message: "Buyer access required." }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const status = body.status;
    if (!["ACCEPTED", "REJECTED"].includes(status)) return NextResponse.json({ message: "Invalid quotation action." }, { status: 400 });
    const quote = await prisma.requirementQuote.findFirst({ where: { id, requirement: { buyerId: buyer.id } }, select: { id: true, status: true, requirementId: true } });
    if (!quote) return NextResponse.json({ message: "Quotation not found." }, { status: 404 });
    if (quote.status !== "PENDING") return NextResponse.json({ message: "This quotation has already been reviewed." }, { status: 409 });
    const updated = await prisma.requirementQuote.update({ where: { id }, data: { status }, select: { id: true, status: true } });
    return NextResponse.json({ message: status === "ACCEPTED" ? "Quotation accepted." : "Quotation rejected.", quote: updated });
  } catch (error) {
    console.error("Review quotation error:", error);
    return NextResponse.json({ message: "Unable to update quotation." }, { status: 500 });
  }
}
