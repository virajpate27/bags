import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emailLayout, getSiteUrl, safeEmailText, sendEmail } from "@/lib/email";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Please log in." }, { status: 401 });
    const buyer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, name: true, emailVerified: true } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ message: "Buyer access required." }, { status: 403 });
    if (!buyer.emailVerified) return NextResponse.json({ message: "Please verify your email before reviewing quotations." }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const status = body.status;
    if (!["ACCEPTED", "REJECTED"].includes(status)) return NextResponse.json({ message: "Invalid quotation action." }, { status: 400 });

    const quote = await prisma.requirementQuote.findFirst({
      where: { id, requirement: { buyerId: buyer.id } },
      select: {
        id: true, status: true, requirementId: true,
        requirement: { select: { title: true } },
        seller: { select: { name: true, email: true, supplierProfile: { select: { companyName: true } } } },
      },
    });
    if (!quote) return NextResponse.json({ message: "Quotation not found." }, { status: 404 });
    if (quote.status !== "PENDING") return NextResponse.json({ message: "This quotation has already been reviewed." }, { status: 409 });

    const updated = await prisma.requirementQuote.update({ where: { id }, data: { status }, select: { id: true, status: true } });
    const companyName = quote.seller.supplierProfile?.companyName || quote.seller.name || "Your company";
    const siteUrl = getSiteUrl();
    const accepted = status === "ACCEPTED";
    const content = `<p>Hello ${safeEmailText(quote.seller.name || "Seller")},</p><p>The buyer has <strong>${accepted ? "accepted" : "rejected"}</strong> your quotation for <strong>${safeEmailText(quote.requirement.title)}</strong>.</p><p>Quotation status: <strong>${status}</strong></p><p><a href="${siteUrl}/seller/dashboard" style="color:#b45309;font-weight:700">Open your seller dashboard</a></p>`;
    await sendEmail({
      to: quote.seller.email,
      subject: `Your TradeBridge quotation was ${accepted ? "accepted" : "rejected"}`,
      text: `The buyer has ${accepted ? "accepted" : "rejected"} your quotation for "${safeEmailText(quote.requirement.title)}". View your seller dashboard: ${siteUrl}/seller/dashboard`,
      html: emailLayout(`Quotation ${accepted ? "accepted" : "rejected"}`, content),
    });

    return NextResponse.json({ message: accepted ? "Quotation accepted." : "Quotation rejected.", quote: updated });
  } catch (error) {
    console.error("Review quotation error:", error);
    return NextResponse.json({ message: "Unable to update quotation." }, { status: 500 });
  }
}
