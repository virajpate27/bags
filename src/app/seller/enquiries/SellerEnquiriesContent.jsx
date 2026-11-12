
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, MessageSquare, Package } from "lucide-react";

const statuses = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "CLOSED",
];

export default function SellerEnquiriesContent() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");

  async function loadEnquiries() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/seller/enquiries", {
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

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function changeStatus(id, status) {
    setBusy(id);
    setMessage("");

    try {
      const response = await fetch(`/api/seller/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );

      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  const filtered = enquiries.filter(
    (item) => filter === "ALL" || item.status === filter
  );

  if (loading) {
    return <div className="p-10 text-center">Loading enquiries...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Enquiry Inbox</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage buyer enquiries for your products.
            </p>
          </div>

          <button
            onClick={loadEnquiries}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {message && (
          <p className="rounded-lg border bg-white p-3 text-sm" role="status">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {["ALL", ...statuses].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm ${
                filter === status
                  ? "bg-slate-900 text-white"
                  : "border bg-white text-gray-600"
              }`}
            >
              {status.replaceAll("_", " ")}
              {status === "ALL"
                ? ` (${enquiries.length})`
                : ` (${enquiries.filter((item) => item.status === status).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <MessageSquare className="mx-auto mb-3 text-gray-400" size={35} />
            <h2 className="font-semibold">No enquiries found</h2>
            <p className="mt-1 text-sm text-gray-500">
              New buyer enquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <h2 className="mt-1 font-semibold">
                      {item.product?.name || "Product no longer available"}
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

                <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Buyer</p>
                    <p className="font-medium">{item.buyer.name}</p>
                    <p className="text-sm text-gray-600">{item.buyer.email}</p>
                    {item.buyer.phone && (
                      <p className="text-sm text-gray-600">{item.buyer.phone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Required quantity</p>
                    <p className="font-medium">
                      {item.quantity ?? "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-semibold text-gray-500">
                    BUYER MESSAGE
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{item.message}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Package size={17} className="text-gray-400" />
                  <span className="mr-2 text-sm font-medium">Update status:</span>

                  <select
                    value={item.status}
                    disabled={busy === item.id}
                    onChange={(e) => changeStatus(item.id, e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
