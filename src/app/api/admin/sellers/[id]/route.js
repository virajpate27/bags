
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emailLayout, safeEmailText, sendEmail } from "@/lib/email";
import { getAdmin, adminError } from "@/lib/admin";

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid seller status." },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      include: { user: { select: { emailVerified: true } } },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Seller profile not found." },
        { status: 404 }
      );
    }

    if (status === "APPROVED" && !supplier.user.emailVerified) {
      return NextResponse.json(
        { message: "This seller must verify their email before approval." },
        { status: 409 }
      );
    }

    const updated = await prisma.supplierProfile.update({
      where: { id },
      data: {
        status,
        isVerified: status === "APPROVED",
      },
      include: { user: { select: { name: true, email: true } } },
    });

    if (status === "APPROVED" || status === "REJECTED") {
      const approved = status === "APPROVED";
      const message = approved
        ? "Your seller application has been approved. You can now access seller features and submit quotations."
        : "Your seller application was not approved at this time. Please contact TradeBridge support if you need clarification.";
      const content = `<p>Hello ${safeEmailText(updated.user.name || "Seller")},</p><p>${message}</p><p><strong>Company:</strong> ${safeEmailText(updated.companyName)}</p><p><strong>Status:</strong> ${status}</p>`;
      await sendEmail({
        to: updated.user.email,
        subject: `TradeBridge seller application ${approved ? "approved" : "update"}`,
        text: `Hello ${updated.user.name || "Seller"}, ${message} Company: ${updated.companyName}. Status: ${status}.`,
        html: emailLayout(`Seller application ${approved ? "approved" : "not approved"}`, content),
      });
    }

    return NextResponse.json({
      message: `Seller ${status.toLowerCase()} successfully.`,
      supplier: updated,
    });
  } catch (error) {
    console.error("Seller moderation error:", error);
    return NextResponse.json(
      { message: "Unable to update seller." },
      { status: 500 }
    );
  }
}
