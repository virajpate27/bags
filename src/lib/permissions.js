import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Resolve the current Better Auth session and then load the authoritative
 * account role from MySQL. Never authorize a request using session.user.role.
 */
export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { user: null, error: "UNAUTHORIZED" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    return { user: null, error: "UNAUTHORIZED" };
  }

  return { user, error: null };
}

/** Require one or more roles, always checking the database role. */
export async function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const result = await getAuthenticatedUser();

  if (result.error) return result;

  if (!roles.includes(result.user.role)) {
    return { user: null, error: "FORBIDDEN" };
  }

  return result;
}

/** Require an approved seller account and return its supplier profile. */
export async function requireApprovedSeller() {
  const result = await requireRole("SELLER");

  if (result.error) return { ...result, supplier: null };

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: result.user.id },
  });

  if (!supplier) {
    return { user: null, supplier: null, error: "NO_PROFILE" };
  }

  if (supplier.status !== "APPROVED") {
    return { user: null, supplier, error: "SELLER_NOT_APPROVED" };
  }

  return { user: result.user, supplier, error: null };
}

/** Convert shared authorization errors into consistent API responses. */
export function getAuthorizationError(error) {
  const errors = {
    UNAUTHORIZED: {
      status: 401,
      message: "Please log in to continue.",
    },
    FORBIDDEN: {
      status: 403,
      message: "You do not have permission to perform this action.",
    },
    NO_PROFILE: {
      status: 403,
      message: "Complete your seller business profile first.",
    },
    SELLER_NOT_APPROVED: {
      status: 403,
      message: "Your seller account is awaiting admin approval.",
    },
  };

  return errors[error] || {
    status: 500,
    message: "Unable to verify account permissions.",
  };
}
