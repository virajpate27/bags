import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emailLayout, getSiteUrl, safeEmailText, sendEmail } from "@/lib/email";

export async function POST(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Please log in as a seller." }, { status: 401 });

    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, name: true, email: true, emailVerified: true, supplierProfile: { select: { status: true, companyName: true } } },
    });
    if (!seller || seller.role !== "SELLER") return NextResponse.json({ message: "Seller access required." }, { status: 403 });
    if (!seller.emailVerified) return NextResponse.json({ message: "Please verify your email before submitting quotations." }, { status: 403 });
    if (seller.supplierProfile?.status !== "APPROVED") return NextResponse.json({ message: "Only approved sellers can submit quotations." }, { status: 403 });

    const { id: requirementId } = await params;
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: { id: true, title: true, buyerId: true, status: true, buyer: { select: { name: true, email: true } } },
    });
    if (!requirement || requirement.status !== "OPEN") return NextResponse.json({ message: "This requirement is no longer open." }, { status: 404 });
    if (requirement.buyerId === seller.id) return NextResponse.json({ message: "You cannot quote on your own requirement." }, { status: 403 });

    const body = await request.json();
    const price = Number(body.price);
    const quantity = body.quantity === "" || body.quantity == null ? null : Number(body.quantity);
    const validityDays = body.validityDays == null || body.validityDays === "" ? 7 : Number(body.validityDays);
    const deliveryTime = String(body.deliveryTime || "").trim();
    const message = String(body.message || "").trim();

    if (!Number.isFinite(price) || price <= 0 || price > 9999999999) return NextResponse.json({ message: "Enter a valid quotation price." }, { status: 400 });
    if (quantity !== null && (!Number.isSafeInteger(quantity) || quantity < 1)) return NextResponse.json({ message: "Enter a valid quantity." }, { status: 400 });
    if (!deliveryTime || deliveryTime.length > 100 || !message || message.length > 3000) return NextResponse.json({ message: "Delivery time and a message are required." }, { status: 400 });
    if (!Number.isSafeInteger(validityDays) || validityDays < 1 || validityDays > 90) return NextResponse.json({ message: "Quotation validity must be between 1 and 90 days." }, { status: 400 });

    const existing = await prisma.requirementQuote.findUnique({ where: { requirementId_sellerId: { requirementId, sellerId: seller.id } }, select: { id: true } });
    if (existing) return NextResponse.json({ message: "You have already submitted a quotation for this requirement. Contact the buyer to discuss revisions." }, { status: 409 });

    const quote = await prisma.requirementQuote.create({
      data: { requirementId, sellerId: seller.id, price, quantity, deliveryTime, validityDays, message },
      select: { id: true, price: true, quantity: true, deliveryTime: true, validityDays: true, message: true, status: true, createdAt: true },
    });

    const siteUrl = getSiteUrl();
    const buyerContent = `<p>Hello ${safeEmailText(requirement.buyer.name || "Buyer")},</p><p><strong>${safeEmailText(seller.supplierProfile.companyName)}</strong> has submitted a quotation for your requirement: <strong>${safeEmailText(requirement.title)}</strong>.</p><p>Quoted price: <strong>₹${Number(quote.price).toLocaleString("en-IN")}</strong><br>Delivery: ${deliveryTime}<br>Validity: ${validityDays} days</p><p><a href="${siteUrl}/buyer/requirements" style="color:#b45309;font-weight:700">View quotation in your dashboard</a></p>`;
    await sendEmail({
      to: requirement.buyer.email,
      subject: "New quotation received on TradeBridge",
      text: `${safeEmailText(seller.supplierProfile.companyName)} submitted a quotation for "${safeEmailText(requirement.title)}". Price: INR ${quote.price}. View it at ${siteUrl}/buyer/requirements`,
      html: emailLayout("You received a new quotation", buyerContent),
    });

    return NextResponse.json({ message: "Your quotation has been sent to the buyer.", quote: { ...quote, price: quote.price.toString() } }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") return NextResponse.json({ message: "You have already quoted on this requirement." }, { status: 409 });
    console.error("Submit requirement quotation error:", error);
    return NextResponse.json({ message: "Unable to submit quotation." }, { status: 500 });
  }
}
