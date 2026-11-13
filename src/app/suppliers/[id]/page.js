import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";
import SupplierProfileRoute from "./SupplierProfileRoute";

async function getSupplier(id) {
  return prisma.supplierProfile.findFirst({
    where: {
      id,
      status: "APPROVED",
    },
    select: {
      id: true,
      companyName: true,
      businessType: true,
      description: true,
      city: true,
      state: true,
      updatedAt: true,
    },
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    return {
      title: "Supplier Not Found",
      description: "This supplier profile is unavailable on TradeBridge.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const location = [supplier.city, supplier.state].filter(Boolean).join(", ");
  const businessType = supplier.businessType
    .toLowerCase()
    .replaceAll("_", " ");
  const descriptionText = (supplier.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const description = (
    descriptionText ||
    `${supplier.companyName} is a ${businessType} listed on TradeBridge${location ? ` in ${location}` : ""}. View its supplier profile and products.`
  ).slice(0, 155);
  const canonicalUrl = absoluteUrl(`/suppliers/${supplier.id}`);

  return {
    title: `${supplier.companyName} – ${businessType}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: `${supplier.companyName} | TradeBridge`,
      description,
      url: canonicalUrl,
      siteName: "TradeBridge",
    },
    twitter: {
      card: "summary",
      title: `${supplier.companyName} | TradeBridge`,
      description,
    },
  };
}

export default async function SupplierProfilePage({ params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Loading supplier profile...</p>
        </main>
      }
    >
      <SupplierProfileRoute supplierId={id} />
    </Suspense>
  );
}
