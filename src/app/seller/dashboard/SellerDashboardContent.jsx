
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function SellerDashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  if (session.user.role !== "SELLER") redirect("/");

  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/seller/register");

  const approved = profile.status === "APPROVED";

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
          <p className="text-sm font-semibold text-amber-600">
            SELLER DASHBOARD
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Welcome, {profile.companyName}!
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Business type: {profile.businessType.replaceAll("_", " ")}
          </p>

          <div className={`mt-6 rounded-xl p-5 ${
            approved
              ? "bg-green-50 text-green-800"
              : profile.status === "REJECTED"
                ? "bg-red-50 text-red-800"
                : "bg-amber-50 text-amber-900"
          }`}>
            <h3 className="font-bold">
              {approved
                ? "Your business is approved"
                : profile.status === "REJECTED"
                  ? "Your business registration was rejected"
                  : "Your business is awaiting admin approval"}
            </h3>

            <p className="mt-2 text-sm">
              {approved
                ? "You can continue setting up your supplier account."
                : profile.status === "REJECTED"
                  ? "Please contact TradeBridge support for more information."
                  : "Our team will review your business details."}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {["My Products", "Buyer Enquiries", "Business Profile"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800">{item}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {approved ? "Coming soon" : "Available after approval"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
