"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Calendar, Compass, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { HeaderLocalTime } from "@/components/header-local-time";
import { UserHeaderMenu } from "@/components/user-header-menu";
import { cn } from "@/lib/utils";

type Props = {
  showAdminLink?: boolean;
  sessionUser?: { name: string; email: string } | null;
};

function MainNavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Calendar;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-accent/70 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
      {label}
    </Link>
  );
}

function HeaderIconSlots() {
  return (
    <div className="text-muted-foreground flex items-center">
      <span className="inline-flex p-2 opacity-60" aria-hidden>
        <Search className="size-4" />
      </span>
      <span className="relative inline-flex p-2 opacity-60" aria-hidden>
        <Bell className="size-4" />
        <span className="bg-destructive absolute top-1.5 right-1.5 size-2 rounded-full" />
      </span>
    </div>
  );
}

export function SiteHeader({ showAdminLink = false, sessionUser }: Props) {
  const pathname = usePathname();
  const isAdminPanel =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const mainNav = (
    <nav
      className="flex min-w-0 items-center gap-0.5 sm:gap-1"
      aria-label="Main"
    >
      <MainNavLink
        href="/discover"
        icon={Compass}
        label="Discover"
        active={pathname.startsWith("/discover")}
      />
      <MainNavLink
        href="/"
        icon={Calendar}
        label="Events"
        active={pathname === "/"}
      />
    </nav>
  );

  const headerTools = (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
      <HeaderLocalTime />
      <Link
        href="/events/new"
        className="text-foreground hover:text-foreground/80 px-2 py-2 text-sm font-medium whitespace-nowrap"
      >
        Create event
      </Link>
      <HeaderIconSlots />
      {sessionUser ? (
        <UserHeaderMenu user={sessionUser} showAdminLink={showAdminLink} />
      ) : (
        <>
          {showAdminLink ? (
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "whitespace-nowrap",
              )}
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "whitespace-nowrap",
            )}
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {isAdminPanel ? (
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-2 px-3 py-2.5 sm:px-5",
            "max-w-none",
          )}
        >
          <Link
            href="/discover"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Luna
          </Link>
          <span className="text-muted-foreground text-sm">Administration</span>
        </div>
      ) : (
        <>
          {/* Mobile: logo at viewport left; menu row same width/padding as <main> */}
          <div className="md:hidden">
            <div className="flex h-11 items-center px-3 sm:pl-4">
              <Link
                href="/discover"
                className="text-foreground text-base font-semibold tracking-tight"
              >
                Luna
              </Link>
            </div>
            <div className="flex h-12 w-full items-center justify-between gap-2 px-3 sm:px-4">
              <div className="min-w-0 flex-1">{mainNav}</div>
              {headerTools}
            </div>
          </div>

          {/* Desktop: logo in left viewport band; menu + tools in same centered column as <main> */}
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 hidden w-full grid-cols-[minmax(0,1fr)_min(100%,48rem)_minmax(0,1fr)] items-center md:grid">
            <div className="flex h-14 items-center justify-start self-stretch pl-3 sm:pl-4">
              <Link
                href="/discover"
                className="text-foreground text-base font-semibold tracking-tight"
              >
                Luna
              </Link>
            </div>
            <div className="flex h-14 w-full min-w-0 items-center justify-start px-3 sm:px-5">
              {mainNav}
            </div>
            <div className="flex h-14 min-w-0 items-center justify-end gap-0.5 pr-3 sm:gap-2 sm:pr-5">
              {headerTools}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
