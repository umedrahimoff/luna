import { redirect, notFound } from "next/navigation";
import { findEventByRouteSegment } from "@/lib/event-by-route-segment";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyEditEventByIdRedirect({ params }: Props) {
  const { id: idRaw } = await params;
  const event = await findEventByRouteSegment(idRaw, {
    select: { publicCode: true },
  });
  if (!event) notFound();
  redirect(`/${event.publicCode}/edit`);
}
