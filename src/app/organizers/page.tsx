import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.organizers.title,
    description: t.organizers.heroHint,
    path: "/organizers",
  });
}

export default async function OrganizersLandingPage() {
  const t = getDictionary(await getUserLanguage());
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-2 sm:py-4">
      <section className="border-border bg-card relative overflow-hidden rounded-2xl border p-5 sm:p-7">
        <div className="from-primary/15 to-primary/0 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
          <div>
            <p className="text-primary inline-flex items-center gap-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              {t.organizers.badge}
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.organizers.heroTitle}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
              {t.organizers.heroHint}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/events/new"
                className={cn(buttonVariants({ size: "sm" }), "w-fit")}
              >
                {t.organizers.hostEvent}
              </Link>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
              >
                {t.organizers.seeLiveEvents}
              </Link>
            </div>
          </div>
          <div className="border-border bg-background overflow-hidden rounded-2xl border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
              alt="Crowded live event audience"
              className="h-52 w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="border-border bg-card overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
            alt="Event page visual"
            className="h-52 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="p-4">
            <h2 className="text-sm font-semibold tracking-tight">What attendees see</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              A clean event page with key details, location, and clear call to
              action.
            </p>
          </div>
        </article>
        <article className="border-border bg-card overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
            alt="Registration flow visual"
            className="h-52 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="p-4">
            <h2 className="text-sm font-semibold tracking-tight">Frictionless join flow</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Registration modal keeps focus on conversion and simplifies attendee input.
            </p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="border-border bg-card rounded-xl border p-4">
          <Gauge className="text-primary size-4" />
          <h2 className="mt-3 text-sm font-semibold tracking-tight">Fast launch</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Publish event details and start accepting requests in minutes.
          </p>
        </article>
        <article className="border-border bg-card rounded-xl border p-4">
          <CalendarCheck2 className="text-primary size-4" />
          <h2 className="mt-3 text-sm font-semibold tracking-tight">Clean registration</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Conversion-oriented join flow with modal form and clear CTA.
          </p>
        </article>
        <article className="border-border bg-card rounded-xl border p-4">
          <UsersRound className="text-primary size-4" />
          <h2 className="mt-3 text-sm font-semibold tracking-tight">Capacity control</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Keep attendance under control and avoid overbooking.
          </p>
        </article>
        <article className="border-border bg-card rounded-xl border p-4">
          <CheckCircle2 className="text-primary size-4" />
          <h2 className="mt-3 text-sm font-semibold tracking-tight">Pro look & feel</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Modern event pages that build trust before people register.
          </p>
        </article>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight">How Luna works</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="bg-background rounded-xl border p-4">
            <p className="text-primary text-xs font-semibold">01</p>
            <h3 className="mt-2 text-sm font-semibold">Create</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Add title, date, location, cover and description.
            </p>
          </article>
          <article className="bg-background rounded-xl border p-4">
            <p className="text-primary text-xs font-semibold">02</p>
            <h3 className="mt-2 text-sm font-semibold">Publish</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Share one clean event page with registration block included.
            </p>
          </article>
          <article className="bg-background rounded-xl border p-4">
            <p className="text-primary text-xs font-semibold">03</p>
            <h3 className="mt-2 text-sm font-semibold">Grow</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Track attendees and run better events every time.
            </p>
          </article>
        </div>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5 sm:p-7">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your next sold-out event starts here
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
          Launch with Luna and give your audience a registration experience that
          feels premium from the first click.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/events/new"
            className={cn(buttonVariants({ size: "sm" }), "w-fit")}
          >
            Create event now
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
          >
            Browse event examples
            <ChevronRight className="ml-1 size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
