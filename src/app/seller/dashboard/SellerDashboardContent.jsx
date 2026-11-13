
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  LayoutDashboard,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const emptyForm = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  unit: "Piece",
  minimumOrderQty: "1",
  imageUrls: [""],
};

function formatPrice(price) {
  if (price === null || price === undefined || price === "") {
    return "Price on request";
  }

  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function SellerDashboardContent() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/seller/products", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load products.");
      }

      setData(result);
    } catch (err) {
      setError(err.message || "Unable to load seller dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      categoryId: String(product.categoryId),
      description: product.description || "",
      price: product.price || "",
      unit: product.unit || "Piece",
      minimumOrderQty: String(product.minimumOrderQty || 1),
      imageUrls: product.images?.length
        ? product.images.map((image) => image.imageUrl)
        : [""],
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function updateImage(index, value) {
    setForm((previous) => ({
      ...previous,
      imageUrls: previous.imageUrls.map((url, i) =>
        i === index ? value : url
      ),
    }));
  }

  function addImageField() {
    setForm((previous) => ({
      ...previous,
      imageUrls:
        previous.imageUrls.length < 8
          ? [...previous.imageUrls, ""]
          : previous.imageUrls,
    }));
  }

  function removeImageField(index) {
    setForm((previous) => ({
      ...previous,
      imageUrls: previous.imageUrls.filter((_, i) => i !== index),
    }));
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        imageUrls: form.imageUrls.filter((url) => url.trim()),
      };

      const response = await fetch(
        editingId
          ? `/api/seller/products/${editingId}`
          : "/api/seller/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save product.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(result.message || "Product saved successfully.");

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete product.");
      }

      setMessage(result.message);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  async function logout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading seller dashboard...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadProducts}
          className="rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-950"
        >
          Try Again
        </button>
      </main>
    );
  }

  const products = data.products || [];
  const supplier = data.supplier;

  const activeCount = products.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const draftCount = products.filter(
    (item) => item.status === "DRAFT"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Trade<span className="text-amber-500">Bridge</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden text-sm font-semibold text-slate-600 sm:block"
            >
              Browse Marketplace
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Seller Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">

          <Link
            href="/seller/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-amber-100 px-4 py-2.5 text-sm font-semibold text-slate-900"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/seller/enquiries"
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <MessageSquare size={18} />
            Enquiries
          </Link>

          <a
            href="#products"
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Package size={18} />
            My Products
          </a>

        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-600">
              <Store size={17} />
              SELLER PANEL
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              {supplier.companyName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your business products and inventory.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { label: "Total Products", value: products.length, icon: Package },
            { label: "Active Products", value: activeCount, icon: LayoutDashboard },
            { label: "Draft Products", value: draftCount, icon: Pencil },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Icon size={21} />
                </div>

                <p className="mt-4 text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Product Form */}
        {showForm && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name *
                </label>

                <input
                  required
                  maxLength={180}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Industrial Water Pump"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Category *
                </label>

                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Select Category</option>

                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Enter price or leave blank"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unit
                </label>

                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Piece, Kg, Ton, Box..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum Order Quantity *
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.minimumOrderQty}
                  onChange={(e) => setForm({ ...form, minimumOrderQty: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Description *
                </label>

                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your product, specifications and features..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Product Image URLs (maximum 8)
                  </label>

                  <button
                    type="button"
                    onClick={addImageField}
                    disabled={form.imageUrls.length >= 8}
                    className="text-sm font-semibold text-amber-600 disabled:opacity-40"
                  >
                    + Add Image URL
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Paste a publicly accessible HTTP or HTTPS image URL.
                </p>

                <div className="mt-3 space-y-3">
                  {form.imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="https://example.com/product-image.jpg"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400"
                      />

                      {form.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50"
                          aria-label="Remove image URL"
                        >
                          <X size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Save as Draft"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Product Inventory */}
        <section id="products" className="mt-10 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Products
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Products listed under your seller account.
              </p>
            </div>

            <button
              onClick={loadProducts}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Package size={45} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-bold text-slate-900">
                No products added yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Add your first product to start building your catalogue.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">MOQ</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                              {product.images?.[0]?.imageUrl ? (
                                <img
                                  src={product.images[0].imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={20} className="text-slate-300" />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {product.category.name}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {formatPrice(product.price)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {product.minimumOrderQty} {product.unit || "Units"}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : product.status === "DRAFT"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                            {product.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditForm(product)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                              aria-label="Edit product"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => deleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                              aria-label="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>

                            {product.status === "ACTIVE" && (
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                aria-label="View product"
                              >
                                <ExternalLink size={16} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
