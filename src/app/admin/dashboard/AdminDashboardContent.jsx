
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Tags,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sellers", label: "Sellers", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tags },
];

export default function AdminDashboardContent() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setMessage("");

    try {
      const [dashboardResponse, categoryResponse] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);

      if (dashboardResponse.status === 401 ||
          dashboardResponse.status === 403) {
        setMessage("You do not have permission to access this dashboard.");
        setData(null);
        return;
      }

      const dashboard = await dashboardResponse.json();
      const categoryData = await categoryResponse.json();

      if (!dashboardResponse.ok) {
        throw new Error(dashboard.message || "Unable to load dashboard.");
      }

      setData(dashboard);
      setCategories(categoryData.categories || []);
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function updateSeller(id, status) {
    if (!window.confirm(`Change seller status to ${status}?`)) return;

    setBusy(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  async function updateProduct(id, status) {
    setBusy(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  async function addCategory(event) {
    event.preventDefault();

    if (!categoryName.trim()) return;

    setBusy("category");
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setCategoryName("");
      setCategoryDescription("");
      setMessage(result.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  async function deleteCategory(id) {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setBusy(`category-${id}`);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        Loading admin dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-gray-500">
            {message || "Please sign in with an administrator account."}
          </p>
          <a
            href="/login"
            className="mt-5 inline-block rounded-lg bg-[#ffc107] px-5 py-2 font-semibold text-black"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const stats = [
    ["Total Users", data.stats.totalUsers, Users],
    ["Buyers", data.stats.totalBuyers, Users],
    ["Sellers", data.stats.totalSellers, Store],
    ["Pending Sellers", data.stats.pendingSellers, ShieldCheck],
    ["Total Products", data.stats.totalProducts, Package],
    ["Active Products", data.stats.activeProducts, CheckCircle],
    ["Draft Products", data.stats.draftProducts, Package],
    ["Categories", data.stats.totalCategories, Tags],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">
              TradeBridge <span className="text-amber-500">Admin</span>
            </h1>
            <p className="text-xs text-gray-500">Marketplace management</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              className="rounded-lg border p-2 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border bg-white p-3">
          <p className="mb-3 px-3 text-xs font-semibold uppercase text-gray-400">
            Administration
          </p>

          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {tabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                    tab === item.id
                      ? "bg-amber-100 text-slate-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-6">
          {message && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              {message}
            </div>
          )}

          {tab === "overview" && (
            <>
              <div>
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor your TradeBridge marketplace.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(([label, value, Icon]) => (
                  <div key={label} className="rounded-xl border bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{label}</p>
                      <Icon className="text-amber-500" size={21} />
                    </div>
                    <p className="mt-3 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <section className="rounded-xl border bg-white p-5">
                <h3 className="mb-4 font-semibold">Recent Registered Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] text-left text-sm">
                    <thead className="border-b text-gray-500">
                      <tr>
                        <th className="py-3">Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {tab === "sellers" && (
            <section className="rounded-xl border bg-white p-5">
              <h2 className="text-xl font-bold">Pending Seller Applications</h2>
              <p className="mb-5 mt-1 text-sm text-gray-500">
                Review seller details before approval.
              </p>

              {data.sellerApplications.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  No pending seller applications.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.sellerApplications.map((seller) => (
                    <div key={seller.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{seller.companyName}</h3>
                          <p className="text-sm text-gray-500">
                            {seller.user.name} · {seller.user.email}
                          </p>
                          <p className="mt-2 text-sm">
                            {seller.businessType.replaceAll("_", " ")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {[seller.city, seller.state, seller.pincode]
                              .filter(Boolean).join(", ") || "Location not provided"}
                          </p>
                          {seller.user.phone && (
                            <p className="text-sm text-gray-500">
                              Phone: {seller.user.phone}
                            </p>
                          )}
                          {seller.description && (
                            <p className="mt-2 text-sm">{seller.description}</p>
                          )}
                        </div>

                        <div className="flex items-start gap-2">
                          <button
                            disabled={busy === seller.id}
                            onClick={() => updateSeller(seller.id, "APPROVED")}
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                          >
                            <CheckCircle className="mr-1 inline" size={15} />
                            Approve
                          </button>
                          <button
                            disabled={busy === seller.id}
                            onClick={() => updateSeller(seller.id, "REJECTED")}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                          >
                            <XCircle className="mr-1 inline" size={15} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "products" && (
            <section className="rounded-xl border bg-white p-5">
              <h2 className="text-xl font-bold">Product Moderation</h2>
              <p className="mb-5 mt-1 text-sm text-gray-500">
                Review draft products and publish approved listings.
              </p>

              {data.pendingProducts.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  No draft products waiting for review.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.pendingProducts.map((product) => (
                    <div key={product.id} className="flex flex-wrap gap-4 rounded-xl border p-4">
                      {product.images?.[0]?.imageUrl && (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {product.category.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Seller: {product.seller.supplierProfile?.companyName || product.seller.name}
                        </p>
                        <p className="mt-1 text-sm">
                          {product.price
                            ? `₹${Number(product.price).toLocaleString("en-IN")}`
                            : "Price on request"}
                          {product.unit ? ` / ${product.unit}` : ""}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <button
                          disabled={busy === product.id}
                          onClick={() => updateProduct(product.id, "ACTIVE")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busy === product.id}
                          onClick={() => updateProduct(product.id, "INACTIVE")}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "categories" && (
            <section className="space-y-5">
              <form
                onSubmit={addCategory}
                className="rounded-xl border bg-white p-5"
              >
                <h2 className="text-xl font-bold">Add Product Category</h2>

                <div className="mt-4 grid gap-3">
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Category name"
                    maxLength={100}
                    required
                    className="rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
                  />

                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Category description (optional)"
                    rows={3}
                    className="rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
                  />

                  <button
                    disabled={busy === "category"}
                    className="flex w-fit items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
                  >
                    <Plus size={18} /> Add Category
                  </button>
                </div>
              </form>

              <div className="rounded-xl border bg-white p-5">
                <h2 className="mb-4 text-xl font-bold">All Categories</h2>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-xs text-gray-500">
                          /{category.slug} · {category._count.products} products
                        </p>
                      </div>

                      <button
                        onClick={() => deleteCategory(category.id)}
                        disabled={
                          busy === `category-${category.id}` ||
                          category._count.products > 0
                        }
                        title={
                          category._count.products > 0
                            ? "Category has products"
                            : "Delete category"
                        }
                        className="rounded-lg border border-red-200 p-2 text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <p className="py-5 text-center text-gray-500">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
