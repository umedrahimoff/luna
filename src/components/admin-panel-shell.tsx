"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminLogout } from "@/app/actions/admin-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Tags,
  LogOut,
  ExternalLink,
  Users,
  Globe,
  MapPin,
  Library,
  ChevronRight,
} from "lucide-react";

const mainLinksCore = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
] as const;

const usersNavItem = {
  href: "/admin/users",
  label: "Users",
  icon: Users,
} as const;

const referenceLinks = [
  { href: "/admin/references/categories", label: "Categories", icon: Tags },
  { href: "/admin/references/countries", label: "Countries", icon: Globe },
  { href: "/admin/references/cities", label: "Cities", icon: MapPin },
] as const;

function navItemClass(active: boolean) {
  return cn(
    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function isMainActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isReferencePath(pathname: string) {
  return pathname.startsWith("/admin/references");
}

/** Dashboard layout: fixed sidebar (~14–15rem), main area flex-1. */
export function AdminPanelShell({
  children,
  canManageUsers = true,
}: {
  children: React.ReactNode;
  /** Administrator only; moderators do not see Users. */
  canManageUsers?: boolean;
}) {
  const pathname = usePathname();
  const mainLinks = canManageUsers
    ? [...mainLinksCore, usersNavItem]
    : mainLinksCore;

  const anyReferenceActive = referenceLinks.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`),
  );
  const inReferences = isReferencePath(pathname);
  const wasInReferences = useRef(inReferences);
  const [referencesOpen, setReferencesOpen] = useState(
    () => inReferences || anyReferenceActive,
  );

  useEffect(() => {
    if (inReferences && !wasInReferences.current) {
      setReferencesOpen(true);
    }
    wasInReferences.current = inReferences;
  }, [inReferences]);

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="border-border bg-card flex w-full shrink-0 flex-col border-b md:w-56 md:border-r md:border-b-0 lg:w-60">
        <div className="border-border flex items-center gap-2 border-b px-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Luna
            </p>
            <p className="truncate text-sm font-semibold">Admin</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-2 md:flex-1 md:overflow-y-auto">
          {mainLinks.map((l) => {
            const active = isMainActive(pathname, l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={navItemClass(active)}
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {l.label}
              </Link>
            );
          })}

          <div className="border-border mt-2 border-t pt-2">
            <button
              type="button"
              onClick={() => setReferencesOpen((o) => !o)}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
                anyReferenceActive &&
                  !referencesOpen &&
                  "bg-muted/60 text-foreground",
              )}
              aria-expanded={referencesOpen}
              aria-controls="admin-nav-references"
              id="admin-nav-references-trigger"
            >
              <Library className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="min-w-0 flex-1 truncate">References</span>
              <ChevronRight
                className={cn(
                  "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                  referencesOpen && "rotate-90",
                )}
                aria-hidden
              />
            </button>
            <div
              id="admin-nav-references"
              role="region"
              aria-labelledby="admin-nav-references-trigger"
              hidden={!referencesOpen}
            >
              <div className="border-border mt-0.5 ml-1 flex flex-col gap-0.5 border-l pl-2">
                {referenceLinks.map((l) => {
                  const active =
                    pathname === l.href || pathname.startsWith(`${l.href}/`);
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={navItemClass(active)}
                    >
                      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        <div className="border-border mt-auto flex flex-col gap-0.5 border-t p-2">
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            View site
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
