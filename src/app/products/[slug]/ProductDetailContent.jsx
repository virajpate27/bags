
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EnquiryForm from "@/components/products/EnquiryForm";

import Link from "next/link";
import {
  MapPin,
  Package,
  Store,
  ShieldCheck,
  Globe,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProductDetailContent() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/products/${encodeURIComponent(slug)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Product not found.");
        }

        if (!cancelled) {
          setProduct(result.product);
          setRelatedProducts(result.relatedProducts || []);
          setSelectedImage(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const formatPrice = (price) => {
    if (!price) return "Price on request";

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const images = product?.images || [];
  const supplier = product?.seller?.supplierProfile;

  const verified =
    supplier?.status === "APPROVED" && supplier?.isVerified;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-32 text-center">
            <p className="text-slate-500">Loading product details...</p>
          </div>
        ) : error || !product ? (
          <div className="mx-auto max-w-7xl px-4 py-32 text-center">
            <Package size={48} className="mx-auto text-slate-300" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This product may be unavailable."}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              <ArrowLeft size={17} />
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 text-sm text-slate-500">
                <Link href="/" className="hover:text-amber-600">
                  Home
                </Link>
                <ChevronRight size={14} />

                <Link href="/products" className="hover:text-amber-600">
                  Products
                </Link>
                <ChevronRight size={14} />

                <span>{product.category.name}</span>
                <ChevronRight size={14} />

                <span className="font-medium text-slate-900">
                  {product.name}
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

              {/* Product Section */}
              <div className="grid gap-8 lg:grid-cols-3">

                {/* Product Gallery */}
                <section className="lg:col-span-2">
                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="flex aspect-square items-center justify-center bg-slate-100">
                        {images.length > 0 ? (
                          <img
                            src={images[selectedImage]?.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-slate-300">
                            <ImageIcon size={65} className="mx-auto" />
                            <p className="mt-3 text-sm">No product image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        {product.category.name}
                      </p>

                      <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                        {product.name}
                      </h1>

                      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">
                          Price
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </p>

                        {product.price && product.unit && (
                          <p className="mt-1 text-sm text-slate-500">
                            Per {product.unit}
                          </p>
                        )}

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <p className="text-sm text-slate-500">
                            Minimum Order Quantity
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {product.minimumOrderQty}{" "}
                            {product.unit || "Units"}
                          </p>
                        </div>

                        <div className="mt-5">
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                "Get Best Quote enquiry functionality will be available in Day 12."
                              )
                            }
                            className="w-full rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-500"
                          >
                            Get Best Quote
                          </button>

                          <p className="mt-2 text-center text-xs text-slate-400">
                            Enquiry submission will be enabled soon.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={17} className="text-green-600" />
                          Business listed on TradeBridge
                        </span>

                        {verified && (
                          <span className="flex items-center gap-2">
                            <ShieldCheck size={17} className="text-blue-600" />
                            Verified supplier
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-white ${selectedImage === index
                            ? "border-amber-400"
                            : "border-slate-200"
                            }`}
                        >
                          <img
                            src={image.imageUrl}
                            alt={`${product.name} image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-900">
                      Product Description
                    </h2>

                    <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {product.description || "No description available."}
                    </div>
                  </section>
                </section>

                {/* Supplier Information */}
                <aside>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-bold text-slate-900">
                      Supplier Information
                    </h2>

                    <div className="mt-5 flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Store size={24} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {supplier?.companyName || product.seller.name}
                        </h3>

                        {verified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                            <ShieldCheck size={14} />
                            Verified Supplier
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-xs text-slate-400">
                          Business Type
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {supplier?.businessType?.replaceAll("_", " ") || "Supplier"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Location
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <MapPin size={15} />
                          {[supplier?.city, supplier?.state]
                            .filter(Boolean)
                            .join(", ") || "India"}
                        </p>
                      </div>

                      {supplier?.address && (
                        <div>
                          <p className="text-xs text-slate-400">
                            Business Address
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {supplier.address}
                          </p>
                        </div>
                      )}

                      {supplier?.website && (
                        <div>
                          <p className="text-xs text-slate-400">
                            Website
                          </p>
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-amber-600 hover:underline"
                          >
                            <Globe size={15} />
                            {supplier.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {supplier?.description && (
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <p className="text-xs font-semibold text-slate-500">
                          About Supplier
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {supplier.description}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "Supplier enquiry functionality will be available in Day 12."
                        )
                      }
                      className="mt-6 w-full rounded-lg border border-amber-400 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-amber-50"
                    >
                      Contact Supplier
                    </button>

                    {supplier?.id && (
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="mt-3 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
                      >
                        View Company Profile
                      </Link>
                    )}
                  </div>
                </aside>
                <EnquiryForm productId={product.id} />
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <section className="mt-14">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Related Products
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        More products from this category.
                      </p>
                    </div>

                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className="text-sm font-semibold text-amber-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {relatedProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex h-40 items-center justify-center bg-slate-100">
                          {item.images?.[0]?.imageUrl ? (
                            <img
                              src={item.images[0].imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={40} className="text-slate-300" />
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-xs text-amber-600">
                            {item.category.name}
                          </p>

                          <h3 className="mt-2 font-semibold text-slate-900">
                            {item.name}
                          </h3>

                          <p className="mt-3 font-bold text-slate-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
