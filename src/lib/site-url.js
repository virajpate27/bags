const FALLBACK_SITE_URL =
  "https://lightseagreen-okapi-247533.hostingersite.com";

/**
 * Returns the canonical origin used by metadata, sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL to the final HTTPS domain in Hostinger.
 */
export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const parsedUrl = new URL(configuredUrl || FALLBACK_SITE_URL);

  if (parsedUrl.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
  }

  return parsedUrl.origin;
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
