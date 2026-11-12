
import { Suspense } from "react";
import ProductDetailContent from "./ProductDetailContent";

function ProductLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">
        Loading product details...
      </p>
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductDetailContent />
    </Suspense>
  );
}
