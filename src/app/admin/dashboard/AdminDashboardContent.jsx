
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";
import SellerReviewActions from "@/components/admin/SellerReviewActions";

export default async function AdminDashboardContent() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/login");

    if (session.user.role !== "ADMIN") redirect("/");

    const [users, sellers, pendingSellers, products, enquiries] =
        await Promise.all([
            prisma.user.count(),
            prisma.supplierProfile.count(),
            prisma.supplierProfile.count({
                where: { status: "PENDING" },
            }),
            prisma.product.count(),
            prisma.enquiry.count(),
        ]);

    const pendingProfiles = await prisma.supplierProfile.findMany({
        where: { status: "PENDING" },
        include: {
            user: {
                select: { name: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <h1 className="text-xl font-bold text-slate-900">
                        Trade<span className="text-amber-500">Bridge</span> Admin
                    </h1>
                    <LogoutButton />
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900">
                    Admin Dashboard
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Welcome, {session.user.name}. Manage your marketplace.
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        ["Total Users", users],
                        ["Suppliers", sellers],
                        ["Pending Approvals", pendingSellers],
                        ["Products", products],
                        ["Enquiries", enquiries],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">{label}</p>
                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        Pending Seller Registrations
                    </h3>

                    <div className="mt-6 space-y-4">
                        {pendingProfiles.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No pending seller registrations.
                            </p>
                        ) : (
                            pendingProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                                >
                                    <div>
                                        <h4 className="font-semibold text-slate-900">
                                            {profile.companyName}
                                        </h4>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {profile.user.name} · {profile.user.email}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {profile.businessType.replaceAll("_", " ")} · {profile.city}, {profile.state}
                                        </p>
                                    </div>

                                    <SellerReviewActions profileId={profile.id} />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
