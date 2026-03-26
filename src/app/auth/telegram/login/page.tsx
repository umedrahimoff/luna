import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { TelegramLoginPanel } from "@/components/auth/telegram-login-panel";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.auth.signInWithTelegram,
    description: "Sign in to Luna with your Telegram account.",
    path: "/auth/telegram/login",
    noIndex: true,
  });
}

type Props = { searchParams: Promise<{ next?: string }> };

export default async function TelegramLoginPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const { next: nextRaw } = await searchParams;
  const nextPath =
    nextRaw?.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : undefined;

  const configured = userSessionConfigured();
  const t = getDictionary(await getUserLanguage());

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {t.auth.signInTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t.telegram.signInHint}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          <Link href="/login" className="text-primary font-medium underline">
            {t.telegram.signInClassic}
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          {t.telegram.envHint}
        </p>
      ) : (
        <TelegramLoginPanel nextPath={nextPath} />
      )}
    </AuthPageShell>
  );
}
