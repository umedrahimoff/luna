"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-border mt-8 border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:px-5 md:flex-row md:items-center md:justify-between md:gap-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/organizers"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            For Organizers
          </Link>
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Help
          </Link>
        </nav>

        <Link
          href="/events/new"
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          Host your event with Luna ↗
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Use
          </Link>
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
