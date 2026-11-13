import { requireRole, getAuthorizationError } from "@/lib/permissions";

/** Backward-compatible admin guard used by existing admin API routes. */
export async function getAdmin() {
  const result = await requireRole("ADMIN");

  if (result.error) {
    return { error: result.error };
  }

  return { user: result.user };
}

export function adminError(error) {
  const result = getAuthorizationError(error);

  if (error === "FORBIDDEN") {
    return {
      message: "Admin access is required.",
      status: 403,
    };
  }

  return {
    message: result.message,
    status: result.status,
  };
}
