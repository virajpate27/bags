
import { Suspense } from "react";
import AdminDashboardContent from "./AdminDashboardContent";

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
