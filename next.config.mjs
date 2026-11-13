/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
    ];

    const noIndexHeader = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/buyer/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/seller/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/login",
        headers: noIndexHeader,
      },
      {
        source: "/register",
        headers: noIndexHeader,
      },
    ];
  },
};

export default nextConfig;
