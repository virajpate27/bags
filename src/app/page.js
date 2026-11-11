
import Link from "next/link";
import {
  Search,
  Factory,
  Package,
  Truck,
  Armchair,
  Shirt,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Headphones,
  ShoppingBag,
} from "lucide-react";

const categories = [
  { name: "Industrial Machinery", icon: Factory },
  { name: "Electronics", icon: Lightbulb },
  { name: "Furniture", icon: Armchair },
  { name: "Textiles", icon: Shirt },
  { name: "Packaging", icon: Package },
  { name: "Automobile Parts", icon: Truck },
];

const products = [
  {
    name: "Industrial LED High Bay Light",
    price: "₹2,450 / Piece",
    supplier: "BrightTech Solutions",
    icon: "💡",
  },
  {
    name: "Automatic Packaging Machine",
    price: "₹1,25,000 / Unit",
    supplier: "ABC Industries",
    icon: "⚙️",
  },
  {
    name: "Office Executive Chair",
    price: "₹5,800 / Piece",
    supplier: "Comfort Furniture",
    icon: "🪑",
  },
  {
    name: "Cotton Fabric Roll",
    price: "₹180 / Meter",
    supplier: "Textile World",
    icon: "🧵",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">

          <Link href="/" className="text-2xl font-bold">
            Trade<span className="text-amber-500">Bridge</span>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/suppliers">Suppliers</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold">
              Login
            </Link>

            <Link
              href="/seller/register"
              className="bg-amber-400 hover:bg-amber-500 px-4 py-3 rounded-lg text-sm font-bold"
            >
              Start Selling
            </Link>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 py-24 text-center">

          <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xs font-bold">
            INDIA'S B2B BUSINESS MARKETPLACE
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold mt-7 leading-tight">
            Find Products. Connect With
            <span className="text-amber-500"> Trusted Suppliers.</span>
          </h1>

          <p className="text-slate-500 mt-6 max-w-2xl mx-auto">
            Discover manufacturers, wholesalers and distributors.
            Find quality products and grow your business.
          </p>

          <div className="max-w-3xl mx-auto mt-10 bg-white border rounded-xl p-2 flex gap-2 shadow-sm">

            <Search className="ml-3 my-auto text-slate-400" />

            <input
              className="flex-1 min-w-0 outline-none px-2 py-3"
              placeholder="Search products, suppliers or categories..."
            />

            <button className="bg-amber-400 px-7 rounded-lg font-bold">
              Search
            </button>

          </div>

          <div className="flex justify-center gap-4 mt-7 flex-wrap">
            <Link
              href="/seller/register"
              className="bg-amber-400 px-6 py-3 rounded-lg font-bold"
            >
              Become a Seller
            </Link>

            <Link
              href="/products"
              className="border px-6 py-3 rounded-lg font-semibold"
            >
              Explore Products
            </Link>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-5 py-16">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Popular Categories</h2>
            <p className="text-slate-500 text-sm mt-2">
              Explore products across industries
            </p>
          </div>

          <Link href="/categories" className="text-amber-600 text-sm font-bold">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                href="/categories"
                key={category.name}
                className="border rounded-xl p-6 text-center hover:border-amber-400 hover:shadow-sm transition"
              >
                <Icon size={32} className="mx-auto text-amber-500" />

                <h3 className="font-semibold text-sm mt-4">
                  {category.name}
                </h3>
              </Link>
            );
          })}

        </div>

      </section>

      {/* Products */}
      <section className="bg-slate-50 py-16">

        <div className="max-w-7xl mx-auto px-5">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-slate-500 text-sm mt-2">
                Discover products from trusted suppliers
              </p>
            </div>

            <Link href="/products" className="text-amber-600 text-sm font-bold">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition"
              >

                <div className="h-44 bg-slate-100 flex items-center justify-center text-6xl">
                  {product.icon}
                </div>

                <div className="p-4">

                  <h3 className="font-semibold text-sm">
                    {product.name}
                  </h3>

                  <p className="text-amber-700 font-bold mt-3">
                    {product.price}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {product.supplier}
                  </p>

                  <Link
                    href="/products"
                    className="block border text-center rounded-lg py-2 mt-4 text-sm font-semibold hover:bg-amber-50"
                  >
                    Get Best Quote
                  </Link>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Why TradeBridge */}
      <section className="max-w-7xl mx-auto px-5 py-16">

        <h2 className="text-2xl font-bold text-center mb-10">
          Why Choose TradeBridge?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              icon: ShieldCheck,
              title: "Trusted Suppliers",
              desc: "Discover suppliers and manufacturers with business profiles.",
            },
            {
              icon: ShoppingBag,
              title: "Wide Product Range",
              desc: "Explore products across multiple business categories.",
            },
            {
              icon: Headphones,
              title: "Easy Enquiries",
              desc: "Connect with suppliers and request competitive quotations.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="text-center p-6">
                <Icon size={38} className="mx-auto text-amber-500" />
                <h3 className="font-bold mt-4">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-3">{item.desc}</p>
              </div>
            );
          })}

        </div>

      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <div className="bg-slate-900 text-white rounded-2xl p-10 text-center">

          <h2 className="text-3xl font-bold">
            Grow Your Business With TradeBridge
          </h2>

          <p className="text-slate-300 mt-4">
            Register your business and connect with potential buyers.
          </p>

          <Link
            href="/seller/register"
            className="inline-flex items-center gap-2 bg-amber-400 text-black px-7 py-3 rounded-lg font-bold mt-7"
          >
            Register Your Business <ArrowRight size={18} />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">

        <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

          <div>
            <h2 className="text-xl font-bold">
              Trade<span className="text-amber-500">Bridge</span>
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Connecting businesses across India.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Marketplace</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500 mt-4">
              <Link href="/products">Products</Link>
              <Link href="/categories">Categories</Link>
              <Link href="/suppliers">Suppliers</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Company</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500 mt-4">
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500 mt-4">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
              <Link href="/seller/register">Become a Seller</Link>
            </div>
          </div>

        </div>

        <div className="border-t text-center py-5 text-xs text-slate-500">
          © 2026 TradeBridge. All rights reserved.
        </div>

      </footer>

    </main>
  );
}
