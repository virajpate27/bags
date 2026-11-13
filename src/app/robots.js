
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lightseagreen-okapi-247533.hostingersite.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/buyer/",
        "/seller/",
        "/login",
        "/register",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
