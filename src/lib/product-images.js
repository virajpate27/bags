import path from "node:path";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

export function getProductUploadDirectory() {
  return path.resolve(
    process.env.TRADEBRIDGE_UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads")
  );
}

export function cleanProductImageUrls(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((url) => typeof url === "string")
      .map((url) => url.trim())
      .filter((url) => {
        if (url.startsWith("/api/uploads/products/")) {
          return !url.includes("..") && !url.includes("\\");
        }

        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      })
  )].slice(0, MAX_PRODUCT_IMAGES);
}

export function detectImageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  ) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return { extension: "png", contentType: "image/png" };
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }

  return null;
}
