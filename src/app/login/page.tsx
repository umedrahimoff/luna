import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/login-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.auth.signInTitle,
    description: "Sign in to manage your profile and events on Luna.",
    path: "/login",
    noIndex: true,
  });
}

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const t = getDictionary(await getUserLanguage());
  const { next: nextRaw } = await searchParams;
  const nextPath =
    nextRaw?.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : undefined;

  const configured = userSessionConfigured();
  const tgHref =
    nextPath != null
      ? `/auth/telegram/login?next=${encodeURIComponent(nextPath)}`
      : "/auth/telegram/login";

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {t.auth.signInTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-primary font-medium underline">
            {t.auth.createOne}
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          {t.auth.envHint}
        </p>
      ) : (
        <>
          <LoginForm nextPath={nextPath} t={t.auth} />
          <div className="border-border relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-background relative z-10 px-2">{t.auth.or}</span>
            <span className="border-border absolute inset-x-0 top-1/2 z-0 border-t" />
          </div>
          <Link
            href={tgHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center",
            )}
          >
            {t.auth.signInWithTelegram}
          </Link>
        </>
      )}
    </AuthPageShell>
  );
}
