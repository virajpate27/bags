
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "UNAUTHORIZED" };
  }

  // Read the role from MySQL instead of trusting client data.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return { error: "FORBIDDEN" };
  }

  return { user };
}

export function adminError(error) {
  if (error === "UNAUTHORIZED") {
    return { message: "Please log in to continue." , status: 401 };
  }

  if (error === "FORBIDDEN") {
    return { message: "Admin access is required.", status: 403 };
  }

  return { message: "Something went wrong.", status: 500 };
}
