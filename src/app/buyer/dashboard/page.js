
import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-500">
        Loading your dashboard...
      </p>
    </main>
  );
}

export default function BuyerDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
