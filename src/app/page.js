
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Package,
  Store,
  ShieldCheck,
  Users,
  Truck,
  MapPin,
  CheckCircle2,
  Building2,
  MessageSquare,
} from "lucide-react";

import prisma from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/products/FavoriteButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TradeBridge – Connect with Indian Manufacturers and Suppliers",
  description:
    "Discover manufacturers, wholesalers, distributors and products across India. Find suppliers, explore products and request business quotations on TradeBridge.",
  alternates: {
    canonical: "/",
  },
};

async function getHomepageData() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      take: 8,
    }),

    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        seller: {
          supplierProfile: {
            is: {
              status: "APPROVED",
            },
          },
        },
      },
      include: {
        category: true,
        images: {
          take: 1,
        },
        seller: {
          select: {
            name: true,
            supplierProfile: {
              select: {
                companyName: true,
                city: true,
                state: true,
                isVerified: true,
                status: true,
              },
            },
          },
        },
      },
      // updatedAt changes when an admin activates an older draft product.
      // This brings newly activated products into the homepage's latest section.
      orderBy: {
        updatedAt: "desc",
      },
      take: 12,
    }),
  ]);

  return { categories, products };
}

function formatPrice(price) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function supplierName(seller) {
  return (
    seller?.supplierProfile?.companyName ||
    seller?.name ||
    "Supplier"
  );
}

function supplierLocation(supplier) {
  return [supplier?.city, supplier?.state]
    .filter(Boolean)
    .join(", ");
}

function ProductCard({ product }) {
  const image = product.images?.[0]?.imageUrl;
  const supplier = product.seller?.supplierProfile;
  const location = supplierLocation(supplier);

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 p-5">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />
            ) : (
              <Package
                size={48}
                className="text-slate-300"
                strokeWidth={1.2}
              />
            )}

            {supplier?.isVerified && (
              <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Verified
              </span>
            )}
          </div>
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <div className="p-4">
        {product.category?.name && (
          <p className="mb-2 text-xs font-semibold text-amber-600">
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-12 font-semibold text-slate-900 transition group-hover:text-amber-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 text-lg font-bold text-slate-900">
          {formatPrice(product.price)}
          {product.price !== null && product.unit && (
            <span className="ml-1 text-xs font-normal text-slate-500">
              / {product.unit}
            </span>
          )}
        </p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Store size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">
              {supplierName(product.seller)}
            </span>
          </p>

          {location && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} />
              {location}
            </p>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
        >
          View Product
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const { categories, products } = await getHomepageData();

  return (
    <>
      <Header />

      <main className="overflow-hidden bg-white">
        {/* Hero Section */}
        <section className="relative bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">
                <CheckCircle2 size={15} />
                India's B2B Business Marketplace
              </div>

              <h1 className="mt-7 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Find the Right
                <span className="block text-amber-400">
                  Suppliers for Your Business
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Discover products, connect with manufacturers and
                wholesalers, and grow your business with TradeBridge.
                Your marketplace for B2B connections across India.
              </p>

              {/* Search */}
              <form
                action="/products"
                method="GET"
                className="mt-8 flex max-w-xl flex-col gap-2 rounded-xl bg-white p-2 sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search
                    size={21}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    type="search"
                    name="q"
                    placeholder="Search products or suppliers..."
                    className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-amber-400 px-7 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-amber-400" />
                  Verified suppliers
                </span>

                <span className="flex items-center gap-2">
                  <MessageSquare size={17} className="text-amber-400" />
                  Direct enquiries
                </span>

                <span className="flex items-center gap-2">
                  <Building2 size={17} className="text-amber-400" />
                  Business connections
                </span>
              </div>
            </div>

            {/* Hero Information Panel */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Welcome to
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      TradeBridge
                    </h2>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-900">
                    <Building2 size={28} />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      icon: Package,
                      title: "Explore Products",
                      text: "Discover products across multiple categories.",
                    },
                    {
                      icon: Store,
                      title: "Connect with Suppliers",
                      text: "Find manufacturers and business partners.",
                    },
                    {
                      icon: MessageSquare,
                      title: "Request Quotations",
                      text: "Send enquiries directly to suppliers.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                          <Icon size={22} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-white">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/products"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-900 transition hover:bg-amber-500"
                >
                  Explore Marketplace
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                  Browse by Category
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Explore Product Categories
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Find the products your business needs.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="group flex min-h-32 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-400 group-hover:text-slate-900">
                      <Package size={23} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-amber-600">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Explore products
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                Product categories will be available soon.
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                  Marketplace Products
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Latest Products
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Discover the latest products listed by suppliers.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                View All Products
                <ArrowRight size={16} />
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Package
                  size={48}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-bold text-slate-900">
                  Products Coming Soon
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  New products from suppliers will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Why TradeBridge */}
        <section className="bg-slate-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Why TradeBridge?
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Everything Your Business Needs to Connect and Grow
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                A simple platform to discover products, find suppliers
                and build business connections.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Store,
                  title: "Supplier Discovery",
                  text: "Explore manufacturers, wholesalers and distributors.",
                },
                {
                  icon: ShieldCheck,
                  title: "Supplier Verification",
                  text: "Identify suppliers with TradeBridge verification.",
                },
                {
                  icon: MessageSquare,
                  title: "Easy Enquiries",
                  text: "Contact suppliers and request product quotations.",
                },
                {
                  icon: Users,
                  title: "Business Network",
                  text: "Build connections with businesses across India.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                      <Icon size={24} />
                    </div>

                    <h3 className="mt-5 font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seller CTA */}
        <section className="bg-amber-400 px-4 py-16 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-800">
                For Manufacturers & Suppliers
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Grow Your Business with TradeBridge
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-800">
                List your products, showcase your company and connect
                with potential buyers looking for your products.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-7 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Become a Supplier
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
