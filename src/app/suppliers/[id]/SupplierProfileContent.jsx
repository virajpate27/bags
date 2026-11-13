
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  ShieldCheck,
  Globe,
  Package,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoriteButton from "@/components/products/FavoriteButton";

export default function SupplierProfileContent({ supplierId }) {
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supplierId) return;

    let cancelled = false;

    async function loadSupplier() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/suppliers/${encodeURIComponent(supplierId)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Supplier not found.");
        }

        if (!cancelled) {
          setSupplier(result.supplier);
          setProducts(result.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load supplier.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSupplier();

    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  function formatPrice(price) {
    if (!price) return "Price on request";

    return `₹${Number(price).toLocaleString("en-IN")}`;
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading supplier profile...
            </p>
          </div>
        ) : error || !supplier ? (
          <div className="mx-auto max-w-7xl px-4 py-32 text-center">
            <Store size={48} className="mx-auto text-slate-300" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Supplier not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This supplier profile is unavailable."}
            </p>

            <Link
              href="/suppliers"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              <ArrowLeft size={17} />
              Browse Suppliers
            </Link>
          </div>
        ) : (
          <>
            {/* Supplier Banner */}
            <section className="bg-slate-950 px-4 py-12 text-white sm:py-16">
              <div className="mx-auto max-w-7xl">
                <Link
                  href="/suppliers"
                  className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400"
                >
                  <ArrowLeft size={16} />
                  Back to Suppliers
                </Link>

                <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
                    <Store size={38} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-bold sm:text-4xl">
                        {supplier.companyName}
                      </h1>

                      {supplier.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                          <ShieldCheck size={15} />
                          Verified Supplier
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-slate-300">
                      {supplier.businessType.replaceAll("_", " ")}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={16} />
                      {[supplier.city, supplier.state]
                        .filter(Boolean)
                        .join(", ") || "India"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-3">

                {/* Company Information */}
                <section className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Company Information
                    </h2>

                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-xs text-slate-400">
                          Company Name
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {supplier.companyName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Business Type
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {supplier.businessType.replaceAll("_", " ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Contact Person
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {supplier.user.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Location
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {[supplier.city, supplier.state, supplier.pincode]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </p>
                      </div>

                      {supplier.address && (
                        <div>
                          <p className="text-xs text-slate-400">
                            Business Address
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {supplier.address}
                          </p>
                        </div>
                      )}

                      {supplier.website && (
                        <div>
                          <p className="text-xs text-slate-400">
                            Company Website
                          </p>
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-amber-600 hover:underline"
                          >
                            <Globe size={16} />
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-bold text-slate-900">
                      About Company
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {supplier.description || "No company description available."}
                    </p>
                  </div>
                </section>

                {/* Products */}
                <section className="lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Products by {supplier.companyName}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {products.length} products displayed
                      </p>
                    </div>
                  </div>

                  {products.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
                      <Package size={42} className="mx-auto text-slate-300" />

                      <h3 className="mt-4 font-bold text-slate-800">
                        No products available
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        This supplier hasn't listed any active products yet.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      {products.map((product) => (
                        <article
                          key={product.id}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
                        >
                          <div className="relative flex h-44 items-center justify-center bg-slate-100">
                            {product.images?.[0]?.imageUrl ? (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={45} className="text-slate-300" />
                            )}
                            <div className="absolute right-3 top-3 z-10">
                              <FavoriteButton productId={product.id} />
                            </div>
                          </div>

                          <div className="p-5">
                            <p className="text-xs font-semibold text-amber-600">
                              {product.category.name}
                            </p>

                            <h3 className="mt-2 font-bold text-slate-900">
                              {product.name}
                            </h3>

                            <p className="mt-3 text-lg font-bold text-slate-900">
                              {formatPrice(product.price)}
                              {product.price && product.unit
                                ? ` / ${product.unit}`
                                : ""}
                            </p>

                            <Link
                              href={`/products/${product.slug}`}
                              className="mt-5 block rounded-lg border border-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-amber-400"
                            >
                              View Product
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
