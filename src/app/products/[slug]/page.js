import { Suspense } from "react";
import ProductDetailContent from "./ProductDetailContent";

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50" />
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}