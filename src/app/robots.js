import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private pages are marked noindex using X-Robots-Tag in next.config.mjs.
        // Keep them crawlable so search engines can read that directive.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
