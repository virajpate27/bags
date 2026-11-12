
import { Suspense } from "react";
import SellerDashboardContent from "./SellerDashboardContent";

export default function SellerDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading seller dashboard...
          </p>
        </main>
      }
    >
      <SellerDashboardContent />
    </Suspense>
  );
}
