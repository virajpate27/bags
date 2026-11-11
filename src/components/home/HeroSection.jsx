
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Truck, Factory } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-slate-950">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-28">

        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            INDIA'S B2B BUSINESS MARKETPLACE
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Products.
            <span className="block text-amber-400">Connect With</span>
            Trusted Suppliers.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
            Discover manufacturers, wholesalers and distributors.
            Find quality products and grow your business with TradeBridge.
          </p>

          <form action="/products" method="GET" className="mt-9 flex max-w-xl rounded-xl bg-white p-2 shadow-xl">
            <Search className="ml-3 mt-3 shrink-0 text-slate-400" size={21} />
            <input
              type="search"
              name="q"
              placeholder="Search products, suppliers or categories..."
              className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500"
            >
              Become a Seller <ArrowRight size={17} />
            </Link>
            <Link
              href="/products"
              className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-white hover:border-amber-400 hover:text-amber-400"
            >
              Explore Products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-7">
            <Factory size={35} className="text-amber-400" />
            <h3 className="mt-5 text-xl font-semibold text-white">Business Connections</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Discover suppliers and manufacturers across multiple industries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <ShieldCheck size={30} className="text-amber-400" />
            <h3 className="mt-4 font-semibold text-white">Trusted Suppliers</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Find relevant business partners.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Truck size={30} className="text-amber-400" />
            <h3 className="mt-4 font-semibold text-white">Bulk Enquiries</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Connect for your business requirements.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
