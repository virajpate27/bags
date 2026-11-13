import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get("q") || "").trim().slice(0, 100);
    const location = String(searchParams.get("location") || "").trim().slice(0, 100);
    const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";

    const AND = [];
    if (search) {
      AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } },
        ],
      });
    }
    if (location) AND.push({ location: { contains: location } });

    const where = { status: "OPEN", ...(AND.length ? { AND } : {}) };
    const [total, requirements] = await prisma.$transaction([
      prisma.requirement.count({ where }),
      prisma.requirement.findMany({
        where,
        orderBy: { createdAt: sort },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          description: true,
          quantity: true,
          location: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);
    return NextResponse.json({
      requirements,
      pagination: { page, pageSize: PAGE_SIZE, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    console.error("Public requirements error:", error);
    return NextResponse.json({ message: "Unable to load buyer requirements." }, { status: 500 });
  }
}
