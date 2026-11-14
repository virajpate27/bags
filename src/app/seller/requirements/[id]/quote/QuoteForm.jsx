"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function QuoteForm({ requirement }) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(requirement.quantity ? String(requirement.quantity) : "");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [validityDays, setValidityDays] = useState("7");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault(); setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/seller/requirements/${requirement.id}/quotes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, quantity, deliveryTime, validityDays, message }),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.href = "/login"; return; }
      if (!response.ok) throw new Error(result.message || "Unable to send quotation.");
      setNotice(result.message);
      setTimeout(() => { window.location.href = "/requirements"; }, 1200);
    } catch (error) { setNotice(error.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/requirements" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16}/> Back to requirements</Link>
        <section className="rounded-xl border bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Buyer requirement</p>
          <h1 className="mt-2 text-2xl font-bold">{requirement.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{requirement.description}</p>
          <p className="mt-3 text-sm text-slate-500">Quantity: {requirement.quantity ?? "Not specified"} · Location: {requirement.location || "Not specified"}</p>
        </section>
        <form onSubmit={submit} className="space-y-5 rounded-xl border bg-white p-6">
          <div><h2 className="text-xl font-bold">Submit your quotation</h2><p className="mt-1 text-sm text-slate-500">Provide clear pricing and delivery details for the buyer.</p></div>
          {notice && <p role="status" className="rounded-lg border bg-slate-50 p-3 text-sm">{notice}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Total quoted price (INR) *<input required type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-3" placeholder="e.g. 25000" /></label>
            <label className="text-sm font-medium">Quantity offered<input type="number" min="1" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-3" placeholder="Quantity" /></label>
            <label className="text-sm font-medium">Estimated delivery time *<input required maxLength={100} value={deliveryTime} onChange={e=>setDeliveryTime(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-3" placeholder="e.g. 10–12 working days" /></label>
            <label className="text-sm font-medium">Quotation valid for *<select value={validityDays} onChange={e=>setValidityDays(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-3">{[7,15,30,45,60,90].map(n=><option key={n} value={n}>{n} days</option>)}</select></label>
          </div>
          <label className="block text-sm font-medium">Quotation details / message *<textarea required maxLength={3000} rows={5} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-3" placeholder="Mention specifications, taxes, packaging, shipping and other important terms." /></label>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"><Send size={17}/>{saving ? "Sending..." : "Send quotation"}</button>
        </form>
      </div>
    </main>
  );
}
