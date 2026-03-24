import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { TelegramLoginPanel } from "@/components/auth/telegram-login-panel";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export const metadata = { title: "Telegram sign in — Luna" };

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

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your code will be sent to Telegram
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          <Link href="/login" className="text-primary font-medium underline">
            ← Sign in with email and password
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          Set `LUNA_SESSION_SECRET` in `.env` and restart the server.
        </p>
      ) : (
        <TelegramLoginPanel nextPath={nextPath} />
      )}
    </AuthPageShell>
  );
}
