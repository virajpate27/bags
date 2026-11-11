
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Industrial Electric Motor",
    category: "Industrial Machinery",
    price: "₹8,500 / Piece",
    supplier: "Shree Industries",
    location: "Mumbai, Maharashtra",
    initials: "IM",
  },
  {
    id: 2,
    name: "LED Panel Light",
    category: "Electronics",
    price: "₹450 / Piece",
    supplier: "Bright Electronics",
    location: "Pune, Maharashtra",
    initials: "LED",
  },
  {
    id: 3,
    name: "Office Wooden Chair",
    category: "Furniture",
    price: "₹2,200 / Piece",
    supplier: "Classic Furniture",
    location: "Delhi, India",
    initials: "CF",
  },
  {
    id: 4,
    name: "Cotton Fabric Roll",
    category: "Textiles",
    price: "₹180 / Meter",
    supplier: "Textile World",
    location: "Surat, Gujarat",
    initials: "TW",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Trending products
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Featured Products
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Discover products from suppliers.
            </p>
          </div>

          <Link href="/products" className="hidden items-center gap-2 text-sm font-semibold text-slate-900 hover:text-amber-600 sm:flex">
            View All <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-44 items-center justify-center bg-slate-100">
                <span className="text-4xl font-bold text-slate-300">
                  {product.initials}
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-amber-600">
                  {product.category}
                </p>

                <h3 className="mt-2 min-h-12 font-bold text-slate-900">
                  {product.name}
                </h3>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {product.price}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {product.supplier}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={14} />
                    {product.location}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-amber-400 px-3 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                  >
                    <MessageCircle size={16} />
                    Get Best Quote
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
