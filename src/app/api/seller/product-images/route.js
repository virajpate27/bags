import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  detectImageType,
  getProductUploadDirectory,
  MAX_PRODUCT_IMAGE_SIZE,
  MAX_PRODUCT_IMAGES,
} from "@/lib/product-images";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, message: "Please login first." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, supplierProfile: { select: { status: true } } },
    });

    if (user?.role !== "SELLER") {
      return NextResponse.json({ success: false, message: "Seller access required." }, { status: 403 });
    }

    if (user.supplierProfile?.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "Your seller account must be approved before uploading images." }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images").filter((item) => item && typeof item.arrayBuffer === "function");

    if (!files.length) {
      return NextResponse.json({ success: false, message: "Choose at least one image." }, { status: 400 });
    }

    if (files.length > MAX_PRODUCT_IMAGES) {
      return NextResponse.json({ success: false, message: `Upload up to ${MAX_PRODUCT_IMAGES} images at a time.` }, { status: 400 });
    }

    const validatedFiles = [];

    for (const file of files) {
      if (file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_SIZE) {
        return NextResponse.json({ success: false, message: "Each image must be between 1 byte and 5 MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const detected = detectImageType(buffer);
      if (!detected) {
        return NextResponse.json({ success: false, message: "Only valid JPG, PNG and WEBP images are allowed." }, { status: 400 });
      }
      validatedFiles.push({ file, buffer, detected });
    }

    const uploadRoot = getProductUploadDirectory();
    const sellerDirectory = path.join(uploadRoot, "products", user.id);
    await mkdir(sellerDirectory, { recursive: true });

    const uploaded = [];
    for (const item of validatedFiles) {
      const filename = `${randomUUID()}.${item.detected.extension}`;
      await writeFile(path.join(sellerDirectory, filename), item.buffer, { flag: "wx" });
      uploaded.push({
        url: `/api/uploads/products/${user.id}/${filename}`,
        name: item.file.name || filename,
        size: item.file.size,
      });
    }

    return NextResponse.json({ success: true, images: uploaded }, { status: 201 });
  } catch (error) {
    console.error("Product image upload error:", error);
    return NextResponse.json({ success: false, message: "Unable to upload product images. Check server storage permissions." }, { status: 500 });
  }
}
