import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { TelegramRegisterForm } from "@/components/auth/telegram-register-form";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export const metadata = { title: "Telegram sign up — Luna" };

export default async function TelegramRegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const configured = userSessionConfigured();

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Sign up with Telegram
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          <Link href="/register" className="text-primary font-medium underline">
            ← Regular email sign up
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          Set `LUNA_SESSION_SECRET` in `.env` and restart the server.
        </p>
      ) : (
        <TelegramRegisterForm />
      )}
    </AuthPageShell>
  );
}
