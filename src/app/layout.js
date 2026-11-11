
import "./globals.css";

export const metadata = {
  title: "TradeBridge | India's B2B Marketplace",
  description:
    "Discover products, connect with manufacturers, wholesalers, distributors and suppliers across India.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
