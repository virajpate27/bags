import Link from "next/link";
import {
  Search,
  Package,
  MapPin,
  Store,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import prisma from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/products/FavoriteButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Products from Indian Manufacturers and Suppliers",
  description:
    "Search and compare products from manufacturers, wholesalers and distributors across India. Filter by category, supplier location and price on TradeBridge.",
  alternates: { canonical: "/products" },
};

const PAGE_SIZE = 12;
const SORT_OPTIONS = ["latest", "price-low", "price-high", "name"];

function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function getProducts(searchParams) {
  const q = readText(searchParams.q || searchParams.search);
  const categorySlug = readText(searchParams.category);
  const location = readText(searchParams.location);
  const minPriceText = readText(searchParams.minPrice);
  const maxPriceText = readText(searchParams.maxPrice);
  const verifiedOnly = searchParams.verified === "1";
  const requestedSort = readText(searchParams.sort) || "latest";
  const sort = SORT_OPTIONS.includes(requestedSort) ? requestedSort : "latest";
  const requestedPage = Number(searchParams.page || 1);

  const minPrice = minPriceText ? Number(minPriceText) : null;
  const maxPrice = maxPriceText ? Number(maxPriceText) : null;
  const priceError =
    (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
    (minPrice !== null && maxPrice !== null && minPrice > maxPrice);

  const and = [];
  if (q) {
    and.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
        {
          seller: {
            supplierProfile: {
              is: { companyName: { contains: q } },
            },
          },
        },
      ],
    });
  }
  if (categorySlug) and.push({ category: { slug: categorySlug } });
  if (location) {
    and.push({
      seller: {
        supplierProfile: {
          is: {
            OR: [
              { city: { contains: location } },
              { state: { contains: location } },
            ],
          },
        },
      },
    });
  }
  if (verifiedOnly) {
    and.push({ seller: { supplierProfile: { is: { isVerified: true } } } });
  }
  if (!priceError && (minPrice !== null || maxPrice !== null)) {
    const price = {};
    if (minPrice !== null) price.gte = minPrice;
    if (maxPrice !== null) price.lte = maxPrice;
    and.push({ price });
  }

  const where = {
    status: "ACTIVE",
    seller: { supplierProfile: { is: { status: "APPROVED" } } },
    ...(and.length ? { AND: and } : {}),
  };
  const orderBy = {
    latest: { updatedAt: "desc" },
    "price-low": { price: "asc" },
    "price-high": { price: "desc" },
    name: { name: "asc" },
  }[sort];

  const [total, categories] = await Promise.all([
    prisma.product.count({
      where: priceError
        ? {
            status: "ACTIVE",
            seller: { supplierProfile: { is: { status: "APPROVED" } } },
          }
        : where,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, Math.max(totalPages, 1))
      : 1;

  const products = priceError
    ? []
    : await prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { take: 1 },
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
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });

  return {
    products,
    categories,
    q,
    categorySlug,
    location,
    minPriceText,
    maxPriceText,
    verifiedOnly,
    sort,
    page,
    total,
    totalPages,
    priceError,
  };
}

function formatPrice(price) {
  if (price === null || price === undefined) return "Price on request";
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function supplierName(seller) {
  return seller?.supplierProfile?.companyName || seller?.name || "Supplier";
}

function supplierLocation(supplier) {
  return [supplier?.city, supplier?.state].filter(Boolean).join(", ");
}

function buildPageUrl(values, page) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.categorySlug) params.set("category", values.categorySlug);
  if (values.location) params.set("location", values.location);
  if (values.minPriceText) params.set("minPrice", values.minPriceText);
  if (values.maxPriceText) params.set("maxPrice", values.maxPriceText);
  if (values.verifiedOnly) params.set("verified", "1");
  if (values.sort && values.sort !== "latest") params.set("sort", values.sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function ProductCard({ product }) {
  const image = product.images?.[0]?.imageUrl;
  const supplier = product.seller?.supplierProfile;
  const location = supplierLocation(supplier);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 p-5">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Package size={52} strokeWidth={1.2} className="text-slate-300" />
          )}
          {supplier?.isVerified && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Verified Supplier
            </span>
          )}
        </div>
      </Link>
      <FavoriteButton
        productId={product.id}
        className="absolute right-3 top-3 z-10"
      />
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
            <span className="truncate">{supplierName(product.seller)}</span>
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
          View Details <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const data = await getProducts(params || {});
  const {
    products,
    categories,
    q,
    categorySlug,
    location,
    minPriceText,
    maxPriceText,
    verifiedOnly,
    sort,
    page,
    total,
    totalPages,
    priceError,
  } = data;
  const filterValues = {
    q,
    categorySlug,
    location,
    minPriceText,
    maxPriceText,
    verifiedOnly,
    sort,
  };
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 || number === totalPages || Math.abs(number - page) <= 1,
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-900 px-4 py-14 text-white sm:py-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">
              TradeBridge Marketplace
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Discover Products from{" "}
              <span className="text-amber-400">Trusted Indian Suppliers</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Search products, materials, categories and suppliers. Refine
              results by location, price and verified supplier status.
            </p>
            <form
              action="/products"
              method="GET"
              className="mt-8 flex max-w-3xl flex-col gap-3 rounded-xl bg-white p-2 sm:flex-row"
            >
              {categorySlug && (
                <input type="hidden" name="category" value={categorySlug} />
              )}
              {location && (
                <input type="hidden" name="location" value={location} />
              )}
              {minPriceText && (
                <input type="hidden" name="minPrice" value={minPriceText} />
              )}
              {maxPriceText && (
                <input type="hidden" name="maxPrice" value={maxPriceText} />
              )}
              {verifiedOnly && (
                <input type="hidden" name="verified" value="1" />
              )}
              {sort !== "latest" && (
                <input type="hidden" name="sort" value={sort} />
              )}
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search size={20} className="shrink-0 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search products, materials, categories or suppliers..."
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

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid items-start gap-7 lg:grid-cols-4">
            <aside className="space-y-5 lg:col-span-1">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={19} className="text-amber-500" />
                  <h2 className="font-bold text-slate-900">Filter Products</h2>
                </div>
                <form
                  action="/products"
                  method="GET"
                  className="mt-5 space-y-4"
                >
                  {q && <input type="hidden" name="q" value={q} />}
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={categorySlug}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400"
                    >
                      <option value="">All Categories</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Supplier Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      defaultValue={location}
                      placeholder="City or state"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Price Range (₹)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="minPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={minPriceText}
                        placeholder="Min"
                        aria-label="Minimum price"
                        className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                      />
                      <input
                        name="maxPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={maxPriceText}
                        placeholder="Max"
                        aria-label="Maximum price"
                        className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="verified"
                      value="1"
                      defaultChecked={verifiedOnly}
                      className="h-4 w-4 rounded border-slate-300 accent-amber-500"
                    />
                    Verified suppliers only
                  </label>
                  <div>
                    <label
                      htmlFor="sort"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Sort By
                    </label>
                    <select
                      id="sort"
                      name="sort"
                      defaultValue={sort}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400"
                    >
                      <option value="latest">Recently Updated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Product Name</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
                  >
                    Apply Filters
                  </button>
                  <Link
                    href="/products"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <X size={15} /> Clear All Filters
                  </Link>
                </form>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-bold text-slate-900">Browse Categories</h2>
                <div className="mt-4 space-y-1">
                  <Link
                    href="/products"
                    className={`block rounded-lg px-3 py-2.5 text-sm ${!categorySlug ? "bg-amber-50 font-semibold text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    All Products
                  </Link>
                  {categories.map((item) => (
                    <Link
                      key={item.id}
                      href={buildPageUrl(
                        { ...filterValues, categorySlug: item.slug },
                        1,
                      )}
                      className={`block rounded-lg px-3 py-2.5 text-sm ${categorySlug === item.slug ? "bg-amber-50 font-semibold text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {categorySlug
                      ? categories.find((item) => item.slug === categorySlug)
                          ?.name || "Products"
                      : "Explore Products"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {priceError ? 0 : total} product{total === 1 ? "" : "s"}{" "}
                    found{q ? ` for "${q}"` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Page {page} of {Math.max(totalPages, 1)}
                </span>
              </div>
              {priceError && (
                <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Please enter a valid minimum and maximum price range.
                </p>
              )}
              {products.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <Package size={48} className="mx-auto text-slate-300" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No Products Found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your search or filters. Only active products
                    from approved suppliers are displayed.
                  </p>
                  <Link
                    href="/products"
                    className="mt-6 inline-flex rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 hover:bg-amber-500"
                  >
                    Clear Filters
                  </Link>
                </div>
              )}
              {totalPages > 1 && (
                <nav
                  aria-label="Product pagination"
                  className="mt-9 flex flex-wrap items-center justify-center gap-2"
                >
                  {page > 1 && (
                    <Link
                      href={buildPageUrl(filterValues, page - 1)}
                      rel="prev"
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-amber-400"
                    >
                      Previous
                    </Link>
                  )}
                  {pageNumbers.map((number, index) => (
                    <span key={number} className="contents">
                      {index > 0 && number - pageNumbers[index - 1] > 1 && (
                        <span className="px-1 text-slate-400">…</span>
                      )}
                      <Link
                        href={buildPageUrl(filterValues, number)}
                        aria-current={number === page ? "page" : undefined}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-semibold ${number === page ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-300 bg-white text-slate-700 hover:border-amber-400"}`}
                      >
                        {number}
                      </Link>
                    </span>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={buildPageUrl(filterValues, page + 1)}
                      rel="next"
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-amber-400"
                    >
                      Next
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
