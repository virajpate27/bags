
import "./globals.css";



export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://lightseagreen-okapi-247533.hostingersite.com/"
  ),

  title: {
    default: "TradeBridge – B2B Marketplace in India",
    template: "%s | TradeBridge",
  },

  description:
    "Discover verified suppliers, manufacturers, wholesalers and distributors across India. Find products, compare suppliers and request business quotations on TradeBridge.",

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

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TradeBridge",
    title: "TradeBridge – B2B Marketplace in India",
    description:
      "Connect with manufacturers, wholesalers and suppliers across India.",
    url: "/",
  },

  twitter: {
    card: "summary_large_image",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
