import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Please log in." }, { status: 401 });
    const buyer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ message: "Buyer access required." }, { status: 403 });
    const requirements = await prisma.requirement.findMany({
      where: { buyerId: buyer.id }, orderBy: { createdAt: "desc" },
      include: { quotes: { orderBy: { createdAt: "desc" }, include: { seller: { select: { id: true, name: true, supplierProfile: { select: { companyName: true, city: true, state: true, isVerified: true } } } } } } },
    });
    const safe = requirements.map((item) => ({ ...item, quotes: item.quotes.map((quote) => ({ ...quote, price: quote.price.toString() })) }));
    return NextResponse.json({ requirements: safe });
  } catch (error) {
    console.error("Buyer requirements error:", error);
    return NextResponse.json({ message: "Unable to load requirements." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Please log in." }, { status: 401 });
    const buyer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ message: "Buyer access required." }, { status: 403 });
    const body = await request.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const location = String(body.location || "").trim();
    const quantity = body.quantity === "" || body.quantity == null ? null : Number(body.quantity);
    if (!title || !description) return NextResponse.json({ message: "Requirement title and description are required." }, { status: 400 });
    if (title.length > 150 || description.length > 5000 || location.length > 150) return NextResponse.json({ message: "Please check the length of your details." }, { status: 400 });
    if (quantity !== null && (!Number.isSafeInteger(quantity) || quantity < 1)) return NextResponse.json({ message: "Enter a valid quantity." }, { status: 400 });
    const requirement = await prisma.requirement.create({ data: { buyerId: buyer.id, title, description, location: location || null, quantity, status: "OPEN" } });
    return NextResponse.json({ message: "Your requirement has been posted.", requirement }, { status: 201 });
  } catch (error) {
    console.error("Create requirement error:", error);
    return NextResponse.json({ message: "Unable to post requirement." }, { status: 500 });
  }
}
