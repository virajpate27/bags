
import { Suspense } from "react";
import SupplierProfileRoute from "./SupplierProfileRoute";

export default function SupplierProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading supplier profile...
          </p>
        </main>
      }
    >
      <SupplierProfileRoute />
    </Suspense>
  );
}
