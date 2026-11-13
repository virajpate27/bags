"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Package, RefreshCw, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function RequirementsMarketplace() {
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [filters, setFilters] = useState({ q: "", location: "", sort: "newest" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ requirements: [], pagination: { page: 1, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequirements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), sort: filters.sort });
      if (filters.q) params.set("q", filters.q);
      if (filters.location) params.set("location", filters.location);
      const response = await fetch(`/api/requirements?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load requirements.");
      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadRequirements(); }, [loadRequirements]);

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setFilters({ q: searchInput.trim(), location: locationInput.trim(), sort: filters.sort });
  }

  function changeSort(value) {
    setPage(1);
    setFilters((current) => ({ ...current, sort: value }));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">TradeBridge Marketplace</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Buyer Requirements</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Discover what businesses are looking to purchase. Find relevant opportunities for your products and services.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-500">Login to manage requirements</Link>
            <Link href="/buyer/requirements" className="rounded-lg border border-slate-500 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Post a requirement</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={applyFilters} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search product or requirement" className="w-full py-3 text-sm outline-none" maxLength={100} />
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3">
            <MapPin size={18} className="shrink-0 text-slate-400" />
            <input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="City or delivery location" className="w-full py-3 text-sm outline-none" maxLength={100} />
          </label>
          <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-500"><Search size={17} /> Search</button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Open purchase requirements</h2>
            <p className="mt-1 text-sm text-slate-500">{data.pagination.total} {data.pagination.total === 1 ? "requirement" : "requirements"} found</p>
          </div>
          <select value={filters.sort} onChange={(event) => changeSort(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {error && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button onClick={loadRequirements} className="inline-flex items-center gap-2 font-semibold"><RefreshCw size={15} /> Retry</button></div>}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading buyer requirements...</div>
        ) : data.requirements.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <ClipboardList className="mx-auto text-slate-400" size={36} />
            <h3 className="mt-4 font-semibold text-slate-900">No open requirements found</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or check back later for new buyer requests.</p>
            {(filters.q || filters.location) && <button onClick={() => { setSearchInput(""); setLocationInput(""); setFilters((current) => ({ ...current, q: "", location: "" })); setPage(1); }} className="mt-4 text-sm font-semibold text-amber-700">Clear filters</button>}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {data.requirements.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Open requirement</div>
                  <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description.length > 420 ? `${item.description.slice(0, 420)}…` : item.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2"><Package size={16} /> Quantity: {item.quantity ?? "Not specified"}</span>
                  <span className="inline-flex items-center gap-2"><MapPin size={16} /> {item.location || "Location not specified"}</span>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href="/login" className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-50">Login to respond</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && data.pagination.totalPages > 1 && (
          <nav aria-label="Requirements pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
            <span className="px-3 text-sm text-slate-600">Page {page} of {data.pagination.totalPages}</span>
            <button disabled={!data.pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={16} /></button>
          </nav>
        )}
      </section>
    </main>
  );
}
