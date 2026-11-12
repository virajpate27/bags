
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BuyerEnquiriesContent() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/buyer/enquiries", {
          cache: "no-store",
        });
        const result = await response.json();

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) throw new Error(result.message);

        setEnquiries(result.enquiries || []);
      } catch (error) {
        setMessage(error.message || "Unable to load enquiries.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading your enquiries...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold">My Enquiries</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Track the enquiries you have sent to suppliers.
        </p>

        {message && (
          <p className="mb-4 rounded-lg border bg-white p-3 text-sm">
            {message}
          </p>
        )}

        {enquiries.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="font-semibold">No enquiries yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Browse products and send your first enquiry.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {item.product?.name || "Product unavailable"}
                    </h2>

                    {item.product?.slug && (
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm text-amber-700 hover:underline"
                      >
                        View product
                      </Link>
                    )}
                  </div>

                  <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Supplier:{" "}
                  {item.seller.supplierProfile?.companyName || item.seller.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Quantity: {item.quantity ?? "Not specified"}
                </p>

                <div className="mt-3 rounded-lg bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm">{item.message}</p>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Sent: {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
