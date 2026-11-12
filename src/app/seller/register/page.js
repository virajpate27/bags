
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Store, ArrowRight } from "lucide-react";

const businessTypes = [
  ["MANUFACTURER", "Manufacturer"],
  ["WHOLESALER", "Wholesaler"],
  ["DISTRIBUTOR", "Distributor"],
  ["RETAILER", "Retailer"],
  ["EXPORTER", "Exporter"],
  ["IMPORTER", "Importer"],
];

export default function SellerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const sessionResult = await authClient.getSession();

      if (!sessionResult.data?.user) {
        router.push("/login?callbackURL=/seller/register");
        return;
      }

      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Registration failed.");
        return;
      }

      router.push("/seller/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-2xl font-bold text-slate-900">
          Trade<span className="text-amber-500">Bridge</span>
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <Store size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Register Your Business
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Join TradeBridge as a supplier.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Company Name *
            </label>
            <input
              name="companyName"
              required
              maxLength={150}
              value={form.companyName}
              onChange={updateField}
              placeholder="Enter company name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Type *
            </label>
            <select
              name="businessType"
              required
              value={form.businessType}
              onChange={updateField}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="">Select business type</option>
              {businessTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={updateField}
              placeholder="Tell buyers about your business..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Address
            </label>
            <input
              name="address"
              value={form.address}
              onChange={updateField}
              placeholder="Street address"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City *
              </label>
              <input
                name="city"
                required
                value={form.city}
                onChange={updateField}
                placeholder="City"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State *
              </label>
              <input
                name="state"
                required
                value={form.state}
                onChange={updateField}
                placeholder="State"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                PIN Code
              </label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={updateField}
                placeholder="PIN code"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={updateField}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            Your business profile will be submitted for admin approval.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Business Registration"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </main>
  );
}
