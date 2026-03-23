import { redirect, notFound } from "next/navigation";
import { findEventByRouteSegment } from "@/lib/event-by-route-segment";

type Props = { params: Promise<{ id: string }> };

/** Legacy /events/:id or /events/:publicCode → /{publicCode}. */
export default async function LegacyEventByIdRedirect({ params }: Props) {
  const { id: idRaw } = await params;
  const event = await findEventByRouteSegment(idRaw, {
    select: { publicCode: true },
  });
  if (!event) notFound();
  redirect(`/${event.publicCode}`);
}
