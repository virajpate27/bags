
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  MessageSquare,
  Building2,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EnquiryForm from "@/components/products/EnquiryForm";

export default function ProductDetailContent() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load product details.");
        }

        if (!isMounted) return;

        const productData = data.product;

        setProduct(productData);
        setRelatedProducts(data.relatedProducts || []);

        const firstImage = productData?.images?.[0]?.imageUrl || "";
        setSelectedImage(firstImage);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "Price on request";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price on request";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  const getSupplierName = (seller) => {
    return (
      seller?.supplierProfile?.companyName ||
      seller?.name ||
      "Supplier"
    );
  };

  const getSupplierLocation = (supplier) => {
    return [supplier?.city, supplier?.state]
      .filter(Boolean)
      .join(", ");
  };

  const getProductImage = (item) => {
    return item?.images?.[0]?.imageUrl || "";
  };

  const scrollToEnquiry = () => {
    document.getElementById("product-enquiry")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <>
        <Header />

        <main className="min-h-[60vh] bg-slate-50 px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="mb-8 h-4 w-64 rounded bg-slate-200" />

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="h-[420px] rounded-2xl bg-slate-200" />

                <div className="space-y-5">
                  <div className="h-8 w-3/4 rounded bg-slate-200" />
                  <div className="h-6 w-1/3 rounded bg-slate-200" />
                  <div className="h-24 rounded bg-slate-200" />
                  <div className="h-12 w-48 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Package size={30} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Product Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error ||
                "This product may have been removed or is currently unavailable."}
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
            >
              <ArrowLeft size={17} />
              Browse Products
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const supplier = product.seller?.supplierProfile;
  const productImages = product.images || [];
  const supplierLocation = getSupplierLocation(supplier);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Breadcrumb */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-slate-500 transition hover:text-amber-600"
            >
              Home
            </Link>

            <ChevronRight size={15} className="text-slate-400" />

            <Link
              href="/products"
              className="text-slate-500 transition hover:text-amber-600"
            >
              Products
            </Link>

            {product.category && (
              <>
                <ChevronRight size={15} className="text-slate-400" />

                <span className="text-slate-500">
                  {product.category.name}
                </span>
              </>
            )}

            <ChevronRight size={15} className="text-slate-400" />

            <span className="max-w-[180px] truncate font-medium text-slate-900">
              {product.name}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-amber-600"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

          {/* Product Details */}
          <div className="grid items-start gap-8 lg:grid-cols-12">
            {/* Product Gallery */}
            <section className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex aspect-square items-center justify-center bg-white p-5">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <ImageIcon size={64} strokeWidth={1.2} />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                </div>

                {productImages.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto border-t border-slate-100 p-4">
                    {productImages.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImage(image.imageUrl)}
                        className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                          selectedImage === image.imageUrl
                            ? "border-amber-400"
                            : "border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Product Information */}
            <section className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {product.category?.name && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {product.category.name}
                    </span>
                  )}

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle2
                      size={13}
                      className="mr-1 inline"
                    />
                    Active Product
                  </span>
                </div>

                <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-6 border-b border-slate-100 pb-6">
                  <p className="text-sm text-slate-500">Price</p>

                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {formatPrice(product.price)}
                    </span>

                    {product.price !== null &&
                      product.price !== undefined &&
                      product.unit && (
                        <span className="text-sm text-slate-500">
                          / {product.unit}
                        </span>
                      )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Contact supplier for the latest price and quotation.
                  </p>
                </div>

                {/* Product Specifications */}
                <div className="grid gap-5 border-b border-slate-100 py-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Minimum Order Quantity
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {product.minimumOrderQty || 1}
                      {product.unit ? ` ${product.unit}` : " Units"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Product Category
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {product.category?.name || "General"}
                    </p>
                  </div>
                </div>

                {/* Supplier Summary */}
                <div className="py-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Supplier Information
                  </p>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Store size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900">
                          {getSupplierName(product.seller)}
                        </h2>

                        {supplier?.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            <ShieldCheck size={13} />
                            Verified
                          </span>
                        )}
                      </div>

                      {supplier?.businessType && (
                        <p className="mt-1 text-sm capitalize text-slate-500">
                          {supplier.businessType
                            .toLowerCase()
                            .replaceAll("_", " ")}
                        </p>
                      )}

                      {supplierLocation && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={15} />
                          {supplierLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={scrollToEnquiry}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-500"
                    >
                      <MessageSquare size={17} />
                      Get Best Quote
                    </button>

                    <button
                      type="button"
                      onClick={scrollToEnquiry}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50"
                    >
                      Contact Supplier
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Description and Supplier Details */}
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-8">
              <h2 className="text-xl font-bold text-slate-900">
                Product Description
              </h2>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.description || "No product description available."}
              </div>
            </section>

            {/* Supplier Details */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <h2 className="text-lg font-bold text-slate-900">
                Supplier Details
              </h2>

              <div className="mt-5 space-y-5">
                <div className="flex items-start gap-3">
                  <Building2
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">Company Name</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {getSupplierName(product.seller)}
                    </p>
                  </div>
                </div>

                {supplier?.businessType && (
                  <div className="flex items-start gap-3">
                    <Store
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">Business Type</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                        {supplier.businessType
                          .toLowerCase()
                          .replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                )}

                {supplierLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {supplierLocation}
                      </p>
                    </div>
                  </div>
                )}

                {supplier?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">Address</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {supplier.address}
                        {supplier.pincode
                          ? ` - ${supplier.pincode}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {supplier?.website && (
                  <div className="flex items-start gap-3">
                    <Globe
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Website</p>
                      <a
                        href={
                          supplier.website.startsWith("http")
                            ? supplier.website
                            : `https://${supplier.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {supplier?.isVerified && (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4">
                  <ShieldCheck
                    size={22}
                    className="shrink-0 text-green-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Verified Supplier
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      This supplier has been verified on TradeBridge.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Enquiry Form */}
          <section
            id="product-enquiry"
            className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Send Your Enquiry
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Interested in this product? Send your requirement directly
                to the supplier and request the best quotation.
              </p>
            </div>

            <EnquiryForm productId={product.id} />
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Related Products
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Explore more products in this category.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="text-sm font-semibold text-amber-600 transition hover:text-amber-700"
                >
                  View All Products
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => {
                  const image = getProductImage(item);

                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 p-4">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Package
                            size={42}
                            className="text-slate-300"
                          />
                        )}
                      </div>

                      <div className="p-4">
                        {item.category?.name && (
                          <p className="mb-2 text-xs font-medium text-amber-600">
                            {item.category.name}
                          </p>
                        )}

                        <h3 className="line-clamp-2 min-h-10 font-semibold text-slate-900 transition group-hover:text-amber-600">
                          {item.name}
                        </h3>

                        <p className="mt-3 text-lg font-bold text-slate-900">
                          {formatPrice(item.price)}
                          {item.price !== null &&
                            item.price !== undefined &&
                            item.unit && (
                              <span className="ml-1 text-xs font-normal text-slate-500">
                                / {item.unit}
                              </span>
                            )}
                        </p>

                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Store size={13} />
                          {getSupplierName(item.seller)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
