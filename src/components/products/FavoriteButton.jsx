"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, LoaderCircle } from "lucide-react";

export default function FavoriteButton({ productId, className = "" }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/buyer/favorites?productId=${encodeURIComponent(productId)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const result = await response.json();

        if (!controller.signal.aborted && response.ok && result.success) {
          setIsFavorite(Boolean(result.isFavorite));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load favourite status:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadStatus();
    return () => controller.abort();
  }, [productId]);

  async function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    if (saving || loading || !productId) return;

    setSaving(true);
    setMessage("");
    setShowLogin(false);

    try {
      const response = await fetch(
        isFavorite
          ? `/api/buyer/favorites?productId=${encodeURIComponent(productId)}`
          : "/api/buyer/favorites",
        isFavorite
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            }
      );

      const result = await response.json();

      if (response.status === 401) {
        setShowLogin(true);
        setMessage("Log in as a buyer to save products.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update saved products.");
      }

      setIsFavorite(Boolean(result.isFavorite));
      setMessage(result.message || "Saved products updated.");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    } 
  }

  return (
    <div className={`${className}`}>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading || saving}
        aria-label={isFavorite ? "Remove from saved products" : "Save product"}
        aria-pressed={isFavorite}
        title={isFavorite ? "Remove from saved products" : "Save product"}
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition disabled:cursor-wait disabled:opacity-70 ${
          isFavorite
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        }`}
      >
        {loading || saving ? (
          <LoaderCircle size={19} className="animate-spin" />
        ) : (
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>

      {(message || showLogin) && (
        <div
          role="status"
          className="absolute right-0 top-12 z-30 w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg"
        >
          <p>{message}</p>
          {showLogin && (
            <Link
              href="/login"
              className="mt-2 inline-block font-semibold text-amber-700 underline"
            >
              Login to TradeBridge
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
