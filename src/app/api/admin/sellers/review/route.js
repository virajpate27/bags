
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { emailLayout, safeEmailText, sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const { profileId, decision } = await request.json();

    if (
      typeof profileId !== "string" ||
      !["APPROVED", "REJECTED"].includes(decision)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid review request." },
        { status: 400 }
      );
    }

    const profile = await prisma.supplierProfile.findUnique({
      where: { id: profileId },
      include: { user: { select: { emailVerified: true } } },
    });

    if (!profile || profile.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Pending seller profile not found." },
        { status: 404 }
      );
    }

    if (decision === "APPROVED" && !profile.user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "This seller must verify their email before approval." },
        { status: 409 }
      );
    }

    const updatedProfile = await prisma.supplierProfile.update({
      where: { id: profileId },
      data: {
        status: decision,
        isVerified: decision === "APPROVED",
      },
      include: { user: { select: { name: true, email: true } } },
    });

    const approved = decision === "APPROVED";
    const statusMessage = approved
      ? "Your seller application has been approved. You can now access seller features and submit quotations."
      : "Your seller application was not approved at this time. Please contact TradeBridge support if you need clarification.";
    const content = `<p>Hello ${safeEmailText(updatedProfile.user.name || "Seller")},</p><p>${statusMessage}</p><p><strong>Company:</strong> ${safeEmailText(updatedProfile.companyName)}</p><p><strong>Status:</strong> ${decision}</p>`;
    await sendEmail({
      to: updatedProfile.user.email,
      subject: `TradeBridge seller application ${approved ? "approved" : "update"}`,
      text: `Hello ${updatedProfile.user.name || "Seller"}, ${statusMessage} Company: ${updatedProfile.companyName}. Status: ${decision}.`,
      html: emailLayout(`Seller application ${approved ? "approved" : "not approved"}`, content),
    });

    return NextResponse.json({
      success: true,
      message: `Seller ${decision.toLowerCase()} successfully.`,
    });
  } catch (error) {
    console.error("Seller review error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to review seller." },
      { status: 500 }
    );
  }
}
