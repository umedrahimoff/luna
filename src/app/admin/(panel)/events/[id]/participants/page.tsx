import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

/** Old URL: redirects to the unified event detail page (Attendees section). */
export default async function AdminEventParticipantsRedirect({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (typeof sp.q === "string" && sp.q.trim()) qs.set("q", sp.q.trim());
  if (sp.sort === "desc") qs.set("sort", "desc");
  const query = qs.toString();
  permanentRedirect(
    `/admin/events/${encodeURIComponent(id)}${query ? `?${query}` : ""}#attendees`,
  );
}
