
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ProductDetailContent from "./ProductDetailContent";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

async function getProduct(slug) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    select: {
      name: true,
      slug: true,
      description: true,
      price: true,
      unit: true,
      images: {
        take: 1,
        select: {
          imageUrl: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product is unavailable.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    product.description?.replace(/\s+/g, " ").slice(0, 155) ||
    `Explore ${product.name} and request a quotation from suppliers on TradeBridge.`;

  const image = product.images?.[0]?.imageUrl;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images
          .map((image) => image.imageUrl)
          .filter(Boolean),
        url: `${siteUrl}/products/${product.slug}`,
        brand: {
          "@type": "Brand",
          name: "TradeBridge",
        },
        ...(product.price !== null && {
          offers: {
            "@type": "Offer",
            price: Number(product.price),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/products/${product.slug}`,
          },
        }),
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <Suspense
        fallback={<div className="min-h-screen bg-slate-50" />}
      >
        <ProductDetailContent />
      </Suspense>
    </>
  );
}
