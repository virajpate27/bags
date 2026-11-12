
"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function EnquiryForm({ productId }) {
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function submitEnquiry(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          message,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to send enquiry.");
      }

      setFeedback("Your enquiry has been sent successfully!");
      setMessage("");
      setQuantity("1");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitEnquiry} className="space-y-4 rounded-xl border bg-white p-5">
      <div>
        <h3 className="text-xl font-bold">Get Best Quote</h3>
        <p className="mt-1 text-sm text-gray-500">
          Send your requirement directly to this supplier.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Required Quantity
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Your Message
        </label>
        <textarea
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please share your specifications, delivery location, and other requirements..."
          required
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-amber-500"
        />
      </div>

      {feedback && (
        <p className="text-sm text-gray-600" role="status">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-500 disabled:opacity-50"
      >
        <Send size={17} />
        {loading ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
