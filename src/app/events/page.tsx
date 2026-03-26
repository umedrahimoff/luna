import type { Metadata } from "next";
import Link from "next/link";
import { PublicEventList } from "@/components/public-event-list";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/user-session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.home.title,
    description: t.home.signedInHint,
    path: "/events",
  });
}

type Search = { category?: string };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category: categorySlug } = await searchParams;
  const [user, language] = await Promise.all([getSessionUser(), getUserLanguage()]);
  const t = getDictionary(language);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.home.title}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          {user ? t.home.signedInHint : t.home.signedOutHint}
        </p>
      </div>

      {user ? (
        <PublicEventList
          categorySlug={categorySlug}
          listBasePath="/events"
          registeredEmail={user.email ?? undefined}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/login?next=/events"
            className={cn(buttonVariants({ size: "sm" }), "w-fit")}
          >
            {t.nav.signIn}
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit",
            )}
          >
            {t.home.discoverAll}
          </Link>
        </div>
      )}
    </div>
  );
}
