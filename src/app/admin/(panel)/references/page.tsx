import Link from "next/link";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { normalizeAdminListQuery } from "@/lib/admin-list-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/admin/references/categories",
    title: "Categories",
    text: "Event types: create, edit, delete (when no events use the category).",
  },
  {
    href: "/admin/references/countries",
    title: "Countries",
    text: "Country directory (name, slug, ISO). Delete only when there are no cities.",
  },
  {
    href: "/admin/references/cities",
    title: "Cities",
    text: "Cities linked to a country; slug is unique per country.",
  },
] as const;

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminReferencesHubPage({
  searchParams,
}: Props) {
  const q = normalizeAdminListQuery((await searchParams).q);
  const needle = q.toLowerCase();
  const shown = q
    ? SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(needle) ||
          s.text.toLowerCase().includes(needle),
      )
    : SECTIONS;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Admin
        </Link>
      </div>
      <h2 className="text-base font-semibold tracking-tight">References</h2>
      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
        Shared data for events and geography. Each section supports full CRUD in
        the list and on the record page.
      </p>

      <AdminListToolbar
        action="/admin/references"
        defaultQuery={q}
        placeholder="Section title or description"
        resetHref="/admin/references"
        showReset={Boolean(q)}
      />

      <ul className="flex max-w-xl flex-col gap-4">
        {shown.map((s) => (
          <li
            key={s.href}
            className="bg-card rounded-xl border p-4 ring-1 ring-black/5"
          >
            <Link
              href={s.href}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {s.title}
            </Link>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {s.text}
            </p>
          </li>
        ))}
      </ul>
      {shown.length === 0 && q ? (
        <p className="text-muted-foreground text-sm">
          Nothing found — try a different search.
        </p>
      ) : null}
    </div>
  );
}
