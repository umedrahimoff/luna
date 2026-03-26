import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { localizedName } from "@/lib/localized-name";
import { buildPageMetadata } from "@/lib/seo";
import { EventCard } from "@/components/event-card";
import {
  avatarBackgroundFromEmail,
  initialsFromName,
} from "@/lib/avatar-style";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  const { username: raw } = await params;
  const username = raw.trim().toLowerCase();
  if (!username) {
    return buildPageMetadata({
      title: t.publicProfile.profileTitle,
      description: "Public organizer profile on Luna.",
      path: `/u/${username || "profile"}`,
    });
  }
  const user = await db.user.findUnique({
    where: { username },
    select: { name: true },
  });
  if (!user) {
    return buildPageMetadata({
      title: t.publicProfile.profileTitle,
      description: "Public organizer profile on Luna.",
      path: `/u/${username}`,
    });
  }
  const title = `${user.name} — Luna`;
  const description = t.publicProfile.profileDescription.replace("{name}", user.name);
  return buildPageMetadata({
    title,
    description,
    path: `/u/${username}`,
  });
}

export default async function PublicUserProfilePage({ params }: Props) {
  const { username: raw } = await params;
  const language = await getUserLanguage();
  const t = getDictionary(language);
  const username = raw.trim().toLowerCase();
  if (!username) notFound();

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      bio: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      events: {
        orderBy: { startsAt: "desc" },
        include: {
          _count: { select: { registrations: true } },
          category: { select: { name: true, nameEn: true, nameRu: true } },
        },
      },
    },
  });
  if (!user) notFound();

  const emailNorm = user.email?.toLowerCase() ?? null;
  const attendedCount = emailNorm
    ? await db.registration.count({
        where: { email: emailNorm },
      })
    : 0;

  const hostedCount = user.events.length;
  const initials = initialsFromName(user.name);
  const avatarBg = avatarBackgroundFromEmail(user.email ?? user.name);
  const joined = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex shrink-0 justify-center sm:justify-start">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              width={96}
              height={96}
              className="size-24 rounded-full object-cover ring-2 ring-foreground/10"
            />
          ) : (
            <span
              className="flex size-24 items-center justify-center rounded-full text-2xl font-semibold text-white shadow-inner ring-2 ring-foreground/10"
              style={{ backgroundColor: avatarBg }}
              aria-hidden
            >
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              @{username}
            </p>
            <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm sm:justify-start">
              <Calendar className="size-4 shrink-0 opacity-80" aria-hidden />
              <span>{t.publicProfile.joined.replace("{date}", joined)}</span>
            </p>
          </div>
          <p className="text-foreground text-sm font-medium tabular-nums">
            <span className="text-foreground">{hostedCount}</span>{" "}
            <span className="text-muted-foreground font-normal">{t.publicProfile.hosted}</span>
            <span className="text-muted-foreground mx-2">·</span>
            <span className="text-foreground">{attendedCount}</span>{" "}
            <span className="text-muted-foreground font-normal">{t.publicProfile.attended}</span>
          </p>
          {user.bio ? (
            <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed sm:mx-0">
              {user.bio}
            </p>
          ) : null}
        </div>
      </header>

      <hr className="border-border" />

      <section className="flex flex-col gap-4" aria-labelledby="hosting-heading">
        <h2
          id="hosting-heading"
          className="text-foreground text-base font-semibold tracking-tight"
        >
          {t.publicProfile.hosting}
        </h2>

        {user.events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
            <CalendarDays
              className="text-muted-foreground/35 size-16"
              strokeWidth={1.25}
              aria-hidden
            />
            <h3 className="text-foreground text-lg font-semibold">
              {t.publicProfile.emptyTitle}
            </h3>
            <p className="text-muted-foreground max-w-sm px-4 text-sm leading-relaxed">
              {t.publicProfile.emptyHint.replace("{name}", user.name)}
            </p>
            <Link
              href="/"
              className="text-primary mt-2 text-sm font-medium underline-offset-4 hover:underline"
            >
              {t.publicProfile.browseEvents}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {user.events.map((e) => (
              <li key={e.id}>
                <EventCard
                  event={{
                    ...e,
                    category: e.category ? { name: localizedName(e.category, language) } : null,
                  }}
                  registeredCount={e._count.registrations}
                  capacity={e.capacity}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
