import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/signup-form";
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
    title: t.auth.signUpTitle,
    description: "Create your Luna account and launch your next event.",
    path: "/register",
    noIndex: true,
  });
}

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const t = getDictionary(await getUserLanguage());
  const configured = userSessionConfigured();

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {t.auth.signUpTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-primary font-medium underline">
            {t.auth.signInLink}
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          {t.auth.envHint}
        </p>
      ) : (
        <>
          <SignupForm t={t.auth} />
          <div className="border-border relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-background relative z-10 px-2">{t.auth.or}</span>
            <span className="border-border absolute inset-x-0 top-1/2 z-0 border-t" />
          </div>
          <Link
            href="/auth/telegram/register"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center",
            )}
          >
            {t.auth.signUpWithTelegram}
          </Link>
        </>
      )}
    </AuthPageShell>
  );
}
