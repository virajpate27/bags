import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";
import ProductDetailContent from "./ProductDetailContent";

async function getProduct(slug) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      seller: {
        supplierProfile: {
          is: {
            status: "APPROVED",
          },
        },
      },
    },
    select: {
      name: true,
      slug: true,
      description: true,
      price: true,
      unit: true,
      category: {
        select: {
          name: true,
        },
      },
      images: {
        take: 5,
        select: {
          imageUrl: true,
        },
      },
      seller: {
        select: {
          supplierProfile: {
            select: {
              companyName: true,
              city: true,
              state: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

function getDescription(description, productName) {
  const plainText = (description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    plainText.slice(0, 155) ||
    `Explore ${productName} and request a quotation from its supplier on TradeBridge.`
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product is unavailable on TradeBridge.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = getDescription(product.description, product.name);
  const canonicalUrl = absoluteUrl(`/products/${product.slug}`);
  const images = product.images.map((image) => image.imageUrl).filter(Boolean);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: canonicalUrl,
      siteName: "TradeBridge",
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images,
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
        description: getDescription(product.description, product.name),
        image: product.images.map((image) => image.imageUrl).filter(Boolean),
        category: product.category?.name,
        url: absoluteUrl(`/products/${product.slug}`),
        ...(product.price !== null && {
          offers: {
            "@type": "Offer",
            price: Number(product.price),
            priceCurrency: "INR",
            url: absoluteUrl(`/products/${product.slug}`),
            seller: {
              "@type": "Organization",
              name: product.seller?.supplierProfile?.companyName || "TradeBridge supplier",
            },
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
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <ProductDetailContent />
      </Suspense>
    </>
  );
}
