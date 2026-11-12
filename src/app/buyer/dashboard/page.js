
import { Suspense } from "react";
import BuyerDashboardContent from "./BuyerDashboardContent";

export default function BuyerDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading buyer dashboard...
          </p>
        </main>
      }
    >
      <BuyerDashboardContent />
    </Suspense>
  );
}
