
import prisma from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lightseagreen-okapi-247533.hostingersite.com";

export default async function sitemap() {
  const products = await prisma.product.findMany({
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
  });

  const staticPages = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productPages = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
