import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isValidEventPublicCode } from "@/lib/event-public-code";
import { parseRecordId } from "@/lib/record-id";

type EventFindRest = Omit<Prisma.EventFindUniqueArgs, "where">;

/**
 * URL segment after /events/ or /admin/events/: try publicCode (8 chars) first,
 * then numeric id — avoids parseInt("12abc") === 12.
 */
export async function findEventByRouteSegment(
  param: string,
  rest: EventFindRest = {},
) {
  if (isValidEventPublicCode(param)) {
    const found = await db.event.findUnique({
      ...rest,
      where: { publicCode: param },
    });
    if (found) return found;
  }
  const id = parseRecordId(param);
  if (id != null) {
    return db.event.findUnique({
      ...rest,
      where: { id },
    });
  }
  return null;
}
