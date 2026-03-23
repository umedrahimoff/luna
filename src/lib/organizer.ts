import { cookies } from "next/headers";
import { headers } from "next/headers";

const COOKIE = "luna_organizer_id";
const HEADER = "x-luna-organizer-id";

/** ID организатора: в том же запросе приходит из middleware (header), далее — из cookie. */
export async function getOrganizerId(): Promise<string> {
  const h = await headers();
  const fromHeader = h.get(HEADER);
  if (fromHeader) return fromHeader;
  const jar = await cookies();
  const fromCookie = jar.get(COOKIE)?.value;
  if (fromCookie) return fromCookie;
  throw new Error("Organizer id unavailable");
}

export async function readOrganizerId(): Promise<string | undefined> {
  const h = await headers();
  const fromHeader = h.get(HEADER);
  if (fromHeader) return fromHeader;
  const jar = await cookies();
  return jar.get(COOKIE)?.value;
}
