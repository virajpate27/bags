
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "BUYER") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">
            Trade<span className="text-amber-500">Bridge</span>
          </h1>

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-amber-600">
            BUYER DASHBOARD
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Welcome, {session.user.name}!
          </h2>

          <p className="mt-3 text-slate-500">
            Your TradeBridge buyer account is active.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              "My Enquiries",
              "Saved Products",
              "My Requirements",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 p-6"
              >
                <h3 className="font-semibold text-slate-800">
                  {item}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
