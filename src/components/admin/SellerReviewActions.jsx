
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerReviewActions({ profileId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reviewSeller(decision) {
    const confirmed = window.confirm(
      `Are you sure you want to ${decision.toLowerCase()} this seller?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/sellers/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, decision }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to update seller.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => reviewSeller("APPROVED")}
          className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>

        <button
          disabled={loading}
          onClick={() => reviewSeller("REJECTED")}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
