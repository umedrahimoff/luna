import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

/** Event detail view removed; send legacy URLs to the edit screen. */
export default async function AdminEventIdRedirect({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (typeof sp.q === "string" && sp.q.trim()) qs.set("q", sp.q.trim());
  if (sp.sort === "desc") qs.set("sort", "desc");
  const query = qs.toString();
  redirect(
    `/admin/events/${encodeURIComponent(id)}/edit${query ? `?${query}` : ""}`,
  );
}
