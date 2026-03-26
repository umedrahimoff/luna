"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

export function SiteFooter() {
  const t = useI18n();
  return (
    <footer className="border-border mt-8 border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:px-5 md:flex-row md:items-center md:justify-between md:gap-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/organizers"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.footer.forOrganizers}
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.footer.help}
          </Link>
        </nav>

        <Link
          href="/events/new"
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          {t.footer.hostCta}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.footer.terms}
          </Link>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
