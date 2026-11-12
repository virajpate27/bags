
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  Heart,
  UserRound,
  Package,
  MapPin,
  Trash2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enquiries", label: "My Enquiries", icon: MessageSquare },
  { id: "requirements", label: "My Requirements", icon: ClipboardList },
  { id: "favorites", label: "Saved Products", icon: Heart },
  { id: "profile", label: "My Profile", icon: UserRound },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-amber-100 text-amber-700",
    QUOTATION_SENT: "bg-purple-100 text-purple-700",
    CLOSED: "bg-slate-100 text-slate-600",
    OPEN: "bg-green-100 text-green-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600"
      }`}>
      {(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

export default function BuyerDashboardContent() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/buyer/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setData(result);
      setForm({
        name: result.user.name || "",
        phone: result.user.phone || "",
      });
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/buyer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save profile.");
      }

      setData((previous) => ({
        ...previous,
        user: result.user,
      }));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function removeFavorite(id) {
    if (!window.confirm("Remove this product from saved products?")) {
      return;
    }

    setRemovingId(id);
    setError("");

    try {
      const response = await fetch(`/api/buyer/favorites/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to remove product.");
      }

      setData((previous) => ({
        ...previous,
        favorites: previous.favorites.filter(
          (item) => item.id !== id
        ),
        stats: {
          ...previous.stats,
          favorites: Math.max(0, previous.stats.favorites - 1),
        },
      }));
    } catch (err) {
      setError(err.message || "Unable to remove product.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading buyer dashboard...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadDashboard}
          className="rounded-lg bg-amber-400 px-5 py-2 font-semibold text-slate-950"
        >
          Try Again
        </button>
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Trade<span className="text-amber-500">Bridge</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden text-sm font-semibold text-slate-600 hover:text-amber-600 sm:block"
            >
              Browse Products
            </Link>

            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg border border-slate-200 p-2 sm:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[250px_1fr]">

        {/* Sidebar */}
        <aside className={`${mobileMenu ? "block" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700">
                {(user.name || "B").charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-3 font-bold text-slate-900">
                {user.name}
              </h2>

              <p className="mt-1 break-all text-xs text-slate-500">
                {user.email}
              </p>

              <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Buyer Account
              </span>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenu(false);
                      setMessage("");
                      setError("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${activeTab === item.id
                      ? "bg-amber-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center gap-3 border-t border-slate-100 pt-5 text-left text-sm font-semibold text-red-600 sm:hidden"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {navigation.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your TradeBridge buyer account.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Overview */}
          {activeTab === "overview" && (
            <>
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    label: "Total Enquiries",
                    value: data.stats.enquiries,
                    icon: MessageSquare,
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    label: "My Requirements",
                    value: data.stats.requirements,
                    icon: ClipboardList,
                    color: "text-purple-600 bg-purple-50",
                  },
                  {
                    label: "Saved Products",
                    value: data.stats.favorites,
                    icon: Heart,
                    color: "text-rose-600 bg-rose-50",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.color}`}>
                        <Icon size={21} />
                      </div>
                      <p className="mt-4 text-sm text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-slate-900">
                  Recent Enquiries
                </h2>

                {data.enquiries.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    You haven't sent any enquiries yet.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100">
                    {data.enquiries.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.product?.name || "General Enquiry"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.seller.supplierProfile?.companyName || item.seller.name}
                            {" · "}
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Enquiries */}
          {activeTab === "enquiries" && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-900">
                My Enquiries
              </h2>

              <Link
                href="/buyer/enquiries"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View All Enquiries
              </Link>

              {data.enquiries.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No enquiries found. Browse products to connect with suppliers.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.enquiries.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {item.product?.name || "General Enquiry"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Supplier: {item.seller.supplierProfile?.companyName || item.seller.name}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>

                      {item.quantity && (
                        <p className="mt-2 text-xs text-slate-500">
                          Quantity: {item.quantity}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-400">
                        Sent on {formatDate(item.createdAt)}
                      </p>

                      {item.product?.slug && (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:underline"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Requirements */}
          {activeTab === "requirements" && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-slate-900">
                  My Requirements
                </h2>

                <Link
                  href="/buyer/requirements"
                  className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-500"
                >
                  + Post Requirement
                </Link>
              </div>


              {data.requirements.length === 0 ? (
                <div className="py-10 text-center">
                  <ClipboardList size={40} className="mx-auto text-slate-300" />
                  <p className="mt-4 font-semibold text-slate-800">
                    No requirements posted
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Your posted buying requirements will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.requirements.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <StatusBadge status={item.status} />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        {item.quantity && <span>Quantity: {item.quantity}</span>}
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {item.location}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        Posted on {formatDate(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Favourites */}
          {activeTab === "favorites" && (
            <section>
              {data.favorites.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                  <Heart size={42} className="mx-auto text-slate-300" />
                  <h2 className="mt-4 font-bold text-slate-900">
                    No saved products
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Products you save will appear here.
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-block rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data.favorites.map((favorite) => {
                    const product = favorite.product;

                    if (!product) return null;

                    return (
                      <article key={favorite.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex h-40 items-center justify-center bg-slate-100">
                          {product.images?.[0]?.imageUrl ? (
                            <img
                              src={product.images[0].imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={40} className="text-slate-300" />
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-xs text-amber-600">
                            {product.category.name}
                          </p>

                          <h3 className="mt-2 font-bold text-slate-900">
                            {product.name}
                          </h3>

                          <p className="mt-2 font-bold text-slate-900">
                            {product.price
                              ? `₹${Number(product.price).toLocaleString("en-IN")}`
                              : "Price on request"}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {product.seller.supplierProfile?.companyName || product.seller.name}
                          </p>

                          <div className="mt-4 flex gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-center text-sm font-semibold text-slate-950"
                            >
                              View Product
                            </Link>

                            <button
                              onClick={() => removeFavorite(favorite.id)}
                              disabled={removingId === favorite.id}
                              aria-label="Remove saved product"
                              className="rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-900">
                Personal Information
              </h2>

              <form onSubmit={saveProfile} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    disabled
                    value={user.email}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Account Type
                  </label>
                  <input
                    disabled
                    value="Buyer"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
