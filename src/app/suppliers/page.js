
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Store,
  ShieldCheck,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const businessTypes = [
  ["MANUFACTURER", "Manufacturer"],
  ["WHOLESALER", "Wholesaler"],
  ["DISTRIBUTOR", "Distributor"],
  ["RETAILER", "Retailer"],
  ["EXPORTER", "Exporter"],
  ["IMPORTER", "Importer"],
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (search.trim()) params.set("search", search.trim());
      if (location.trim()) params.set("location", location.trim());
      if (businessType) params.set("businessType", businessType);

      const response = await fetch(`/api/suppliers?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load suppliers.");
      }

      setSuppliers(result.suppliers || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, location, businessType]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    setBusinessType("");
    setPage(1);
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 px-4 py-14 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold text-amber-400">
              TRADEBRIDGE NETWORK
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Find Trusted Suppliers
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Connect with manufacturers, wholesalers, distributors and
              businesses across India.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Search and filters */}
          <form
            onSubmit={applyFilters}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-4"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Company Name
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company..."
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Business Type
              </label>

              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="">All Business Types</option>

                {businessTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                City or State
              </label>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500"
              >
                <Search size={17} />
                Search
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Supplier results */}
          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Registered Suppliers
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {pagination.total} approved suppliers found
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
                <p className="text-sm text-slate-500">
                  Loading suppliers...
                </p>
              </div>
            ) : error ? (
              <div role="alert" className="rounded-xl bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
                <Store size={45} className="mx-auto text-slate-300" />

                <h3 className="mt-4 font-bold text-slate-800">
                  No suppliers found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another company name, business type or location.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-5 text-sm font-semibold text-amber-600"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {suppliers.map((supplier) => (
                  <article
                    key={supplier.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Store size={27} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-slate-900">
                          {supplier.companyName}
                        </h3>

                        {supplier.isVerified && (
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                            <ShieldCheck size={14} />
                            Verified Supplier
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {supplier.businessType.replaceAll("_", " ")}
                    </p>

                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} />
                      {[supplier.city, supplier.state]
                        .filter(Boolean)
                        .join(", ") || "India"}
                    </p>

                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {supplier.description || "Business information available on supplier profile."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <Package size={15} />
                        {supplier.activeProductCount} Active Products
                      </span>

                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="text-sm font-bold text-amber-600 hover:text-amber-700"
                      >
                        View Profile →
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
                  onClick={() => setPage((current) => current - 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <span className="text-sm text-slate-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
