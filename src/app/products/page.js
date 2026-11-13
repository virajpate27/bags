
import Link from "next/link";
import {
  Search,
  Package,
  MapPin,
  Store,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

import prisma from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Browse Products from Indian Manufacturers and Suppliers",
  description:
    "Explore products from manufacturers, wholesalers and distributors across India. Find suppliers and request competitive quotations on TradeBridge.",
  alternates: {
    canonical: "/products",
  },
};

async function getProducts(searchParams) {
  const q = typeof searchParams.q === "string"
    ? searchParams.q.trim()
    : "";

  const categorySlug =
    typeof searchParams.category === "string"
      ? searchParams.category
      : "";

  const where = {
    status: "ACTIVE",
    ...(q && {
      name: {
        contains: q,
      },
    }),
    ...(categorySlug && {
      category: {
        slug: categorySlug,
      },
    }),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return { products, categories, q, categorySlug };
}

function formatPrice(price) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function getSupplierName(seller) {
  return (
    seller?.supplierProfile?.companyName ||
    seller?.name ||
    "Supplier"
  );
}

function getSupplierLocation(supplier) {
  return [supplier?.city, supplier?.state]
    .filter(Boolean)
    .join(", ");
}

function ProductCard({ product }) {
  const image = product.images?.[0]?.imageUrl;
  const supplier = product.seller?.supplierProfile;
  const location = getSupplierLocation(supplier);

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
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
              size={52}
              strokeWidth={1.2}
              className="text-slate-300"
            />
          )}

          {supplier?.isVerified && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Verified Supplier
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category?.name && (
          <p className="mb-2 text-xs font-semibold text-amber-600">
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-2 min-h-12 font-semibold text-slate-900 transition group-hover:text-amber-600">
            {product.name}
          </h2>
        </Link>

        <p className="mt-3 text-lg font-bold text-slate-900">
          {formatPrice(product.price)}
          {product.price !== null && product.unit && (
            <span className="ml-1 text-xs font-normal text-slate-500">
              / {product.unit}
            </span>
          )}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Min. Order: {product.minimumOrderQty || 1}
          {product.unit ? ` ${product.unit}` : " Units"}
        </p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Store size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">
              {getSupplierName(product.seller)}
            </span>
          </p>

          {location && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} className="shrink-0" />
              {location}
            </p>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const { products, categories, q, categorySlug } =
    await getProducts(params || {});

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Page Hero */}
        <section className="bg-slate-900 px-4 py-14 text-white sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">
              TradeBridge Marketplace
            </p>

            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Discover Products from
              <span className="text-amber-400">
                {" "}Trusted Indian Suppliers
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore products from manufacturers, wholesalers and
              distributors. Connect with suppliers and request the
              best quotations for your business.
            </p>

            {/* Search Form */}
            <form
              action="/products"
              method="GET"
              className="mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-2 sm:flex-row"
            >
              {categorySlug && (
                <input
                  type="hidden"
                  name="category"
                  value={categorySlug}
                />
              )}

              <div className="flex flex-1 items-center gap-3 px-3">
                <Search
                  size={20}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search products, materials..."
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-amber-400 px-7 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
              >
                Search Products
              </button>
            </form>
          </div>
        </section>

        {/* Products Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-4">
            {/* Sidebar Filters */}
            <aside className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={19}
                  className="text-amber-500"
                />
                <h2 className="font-bold text-slate-900">
                  Categories
                </h2>
              </div>

              <div className="mt-5 space-y-1">
                <Link
                  href="/products"
                  className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                    !categorySlug
                      ? "bg-amber-50 font-semibold text-amber-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Products
                </Link>

                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                      categorySlug === category.slug
                        ? "bg-amber-50 font-semibold text-amber-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {categorySlug
                      ? categories.find(
                          (item) => item.slug === categorySlug
                        )?.name || "Products"
                      : "Explore Products"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {products.length} product
                    {products.length === 1 ? "" : "s"} found
                    {q ? ` for "${q}"` : ""}
                  </p>
                </div>

                {(q || categorySlug) && (
                  <Link
                    href="/products"
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Clear Filters
                  </Link>
                )}
              </div>

              {products.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <Package
                    size={48}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No Products Found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try another search term or select a different category.
                  </p>

                  <Link
                    href="/products"
                    className="mt-6 inline-flex rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 hover:bg-amber-500"
                  >
                    View All Products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
