
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const allowedBusinessTypes = [
  "MANUFACTURER",
  "WHOLESALER",
  "DISTRIBUTOR",
  "RETAILER",
  "EXPORTER",
  "IMPORTER",
];

export async function POST(request) {
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

    const body = await request.json();

    const companyName = String(body.companyName || "").trim();
    const businessType = String(body.businessType || "");
    const description = String(body.description || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();
    const website = String(body.website || "").trim();

    if (!companyName || companyName.length > 150) {
      return NextResponse.json(
        { success: false, message: "Enter a valid company name." },
        { status: 400 }
      );
    }

    if (!allowedBusinessTypes.includes(businessType)) {
      return NextResponse.json(
        { success: false, message: "Select a valid business type." },
        { status: 400 }
      );
    }

    if (!city || !state) {
      return NextResponse.json(
        { success: false, message: "City and state are required." },
        { status: 400 }
      );
    }

    if (website && !/^https?:\/\/.+/i.test(website)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid website URL including https://." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.supplierProfile.upsert({
        where: { userId: session.user.id },
        update: {
          companyName,
          businessType,
          description,
          address,
          city,
          state,
          pincode,
          website: website || null,
          isVerified: false,
          status: "PENDING",
        },
        create: {
          userId: session.user.id,
          companyName,
          businessType,
          description,
          address,
          city,
          state,
          pincode,
          website: website || null,
          isVerified: false,
          status: "PENDING",
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "SELLER" },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Business registration submitted for admin approval.",
    });
  } catch (error) {
    console.error("Seller registration error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to submit business registration." },
      { status: 500 }
    );
  }
}
