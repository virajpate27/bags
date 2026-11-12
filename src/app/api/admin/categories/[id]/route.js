
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdmin, adminError } from "@/lib/admin";

export async function DELETE(request, { params }) {
  try {
    const admin = await getAdmin();

    if (admin.error) {
      const error = adminError(admin.error);
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return NextResponse.json(
        { message: "Invalid category ID." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { message: "This category contains products. Reassign or remove those products first." },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { message: "Unable to delete category." },
      { status: 500 }
    );
  }
}
