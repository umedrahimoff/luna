import type { Metadata } from "next";
import { PublicEventList } from "@/components/public-event-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.discover.title,
    description: t.discover.hint,
    path: "/",
  });
}

type Search = { category?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category: categorySlug } = await searchParams;
  const language = await getUserLanguage();
  const t = getDictionary(language);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.home.title}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          {t.discover.hint}
        </p>
      </div>
      <PublicEventList categorySlug={categorySlug} listBasePath="/" />
    </div>
  );
}
