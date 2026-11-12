
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Package,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("latest");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        sort,
      });

      if (search.trim()) params.set("search", search.trim());
      if (location.trim()) params.set("location", location.trim());
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load products.");
      }

      setProducts(result.products || []);
      setCategories(result.categories || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, location, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function resetFilters() {
    setSearch("");
    setLocation("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
    setPage(1);
  }

 function applyFilters(e) {
  e.preventDefault();
  setPage(1);
}

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <div className="bg-slate-950 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold text-amber-400">
              TRADEBRIDGE MARKETPLACE
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Explore Business Products
            </h1>

            <p className="mt-3 text-sm text-slate-300">
              Discover products and connect with suppliers across India.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">

            {/* Filters */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-slate-900">
                  <SlidersHorizontal size={18} />
                  Filters
                </h2>

                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-amber-600"
                >
                  Clear All
                </button>
              </div>

              <form onSubmit={applyFilters} className="mt-6 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Search Products
                  </label>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Product name..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>

                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or state..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Minimum Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min price"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Maximum Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max price"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500"
                >
                  Apply Filters
                </button>
              </form>
            </aside>

            {/* Product Results */}
            <section className="lg:col-span-3">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    All Products
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {pagination.total} products found
                  </p>
                </div>

                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none"
                >
                  <option value="latest">Latest Products</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
                  <p className="text-sm text-slate-500">Loading products...</p>
                </div>
              ) : error ? (
                <div role="alert" className="rounded-xl bg-red-50 p-6 text-sm text-red-700">
                  {error}
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
                  <Package className="mx-auto text-slate-300" size={42} />
                  <h3 className="mt-4 font-bold text-slate-800">
                    No products found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-5 text-sm font-semibold text-amber-600"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex h-44 items-center justify-center bg-slate-100">
                        {product.images?.[0]?.imageUrl ? (
                          <img
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={45} className="text-slate-300" />
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-xs font-semibold text-amber-600">
                          {product.category.name}
                        </p>

                        <h3 className="mt-2 min-h-12 font-bold text-slate-900">
                          {product.name}
                        </h3>

                        <p className="mt-3 text-lg font-bold text-slate-900">
                          {product.price
                            ? `₹${Number(product.price).toLocaleString("en-IN")}`
                            : "Price on request"}
                          {product.price && product.unit
                            ? ` / ${product.unit}`
                            : ""}
                        </p>

                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                          <Store size={15} />
                          {product.seller.supplierProfile?.companyName ||
                            product.seller.name}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={14} />
                          {[
                            product.seller.supplierProfile?.city,
                            product.seller.supplierProfile?.state,
                          ].filter(Boolean).join(", ") || "India"}
                        </p>

                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-5 block rounded-lg border border-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                        >
                          View Product
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="text-sm text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
