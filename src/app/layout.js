import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: {
    default: "TradeBridge – B2B Marketplace in India",
    template: "%s | TradeBridge",
  },
  description:
    "Discover manufacturers, wholesalers, distributors and suppliers across India. Explore products, compare businesses and request quotations on TradeBridge.",
  applicationName: "TradeBridge",
  keywords: [
    "B2B marketplace India",
    "Indian manufacturers",
    "wholesale suppliers India",
    "product suppliers",
    "business directory India",
    "bulk products",
    "get best quote",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TradeBridge",
    title: "TradeBridge – B2B Marketplace in India",
    description:
      "Connect with manufacturers, wholesalers and suppliers across India.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "TradeBridge – B2B Marketplace in India",
    description:
      "Find Indian manufacturers, wholesalers and suppliers on TradeBridge.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
