
"use client";

import { useEffect, useState } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

export default function RequirementsContent() {
  const [requirements, setRequirements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRequirements() {
    setLoading(true);

    try {
      const response = await fetch("/api/buyer/requirements", {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) throw new Error(result.message);

      setRequirements(result.requirements || []);
    } catch (error) {
      setMessage(error.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequirements();
  }, []);

  async function submitRequirement(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/buyer/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          quantity,
          location,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) throw new Error(result.message);

      setTitle("");
      setDescription("");
      setQuantity("");
      setLocation("");
      setMessage(result.message);
      await loadRequirements();
    } catch (error) {
      setMessage(error.message || "Unable to post requirement.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    setMessage("");

    try {
      const response = await fetch(`/api/buyer/requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      await loadRequirements();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Requirements</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tell suppliers what products you are looking to purchase.
            </p>
          </div>

          <button
            onClick={loadRequirements}
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

        <form
          onSubmit={submitRequirement}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <h2 className="text-lg font-semibold">Post a New Requirement</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Product / Requirement Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              placeholder="Example: Industrial Electric Motors"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Requirement Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              required
              rows={5}
              placeholder="Describe specifications, quality, delivery requirements, etc."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Delivery Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={150}
                placeholder="City, State"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
          >
            <PlusCircle size={18} />
            {saving ? "Posting..." : "Post Requirement"}
          </button>
        </form>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">My Posted Requirements</h2>

          {loading ? (
            <p className="py-6 text-center text-gray-500">Loading...</p>
          ) : requirements.length === 0 ? (
            <p className="py-6 text-center text-gray-500">
              You haven't posted any requirements yet.
            </p>
          ) : (
            <div className="space-y-4">
              {requirements.map((item) => (
                <article key={item.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                    {item.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Quantity: {item.quantity ?? "Not specified"}</span>
                    <span>Location: {item.location || "Not specified"}</span>
                    <span>
                      Posted: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      disabled={item.status === "CLOSED"}
                      onClick={() => updateStatus(item.id, "CLOSED")}
                      className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Close Requirement
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
