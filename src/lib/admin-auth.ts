import { cookies } from "next/headers";

const COOKIE = "luna_admin_session";

/**
 * Clears the legacy emergency-login cookie if present.
 * Admin access is no longer granted via this cookie — only via a User with staff role.
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
