import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProductUploadDirectory } from "@/lib/product-images";

export const runtime = "nodejs";

const contentTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request, { params }) {
  try {
    const { path: segments = [] } = await params;
    if (segments.length !== 3 || segments[0] !== "products") {
      return new NextResponse("Not found", { status: 404 });
    }

    const [userId, filename] = segments.slice(1);
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(userId) || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const root = getProductUploadDirectory();
    const filePath = path.resolve(root, "products", userId, filename);
    const allowedPrefix = `${path.resolve(root)}${path.sep}`;
    if (!filePath.startsWith(allowedPrefix)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = await readFile(filePath);
    const extension = path.extname(filename).slice(1);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypes[extension],
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
