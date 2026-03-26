import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { TelegramRegisterForm } from "@/components/auth/telegram-register-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getUserLanguage());
  return buildPageMetadata({
    title: t.auth.signUpWithTelegram,
    description: "Create your Luna account via Telegram in a few steps.",
    path: "/auth/telegram/register",
    noIndex: true,
  });
}

export default async function TelegramRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const configured = userSessionConfigured();
  const t = getDictionary(await getUserLanguage());

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {t.telegram.signUpTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          <Link href="/register" className="text-primary font-medium underline">
            {t.telegram.signUpClassic}
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          {t.telegram.envHint}
        </p>
      ) : (
        <TelegramRegisterForm />
      )}
    </AuthPageShell>
  );
}
