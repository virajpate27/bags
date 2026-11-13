import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

export default async function sitemap() {
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: {
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
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.supplierProfile.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const staticPages = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/suppliers"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const productPages = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const supplierPages = suppliers.map((supplier) => ({
    url: absoluteUrl(`/suppliers/${supplier.id}`),
    lastModified: supplier.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...supplierPages];
}
