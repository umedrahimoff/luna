import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/login-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";
import { cn } from "@/lib/utils";

export const metadata = { title: "Sign in — Luna" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
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
          Sign in
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          No account yet?{" "}
          <Link href="/register" className="text-primary font-medium underline">
            Create one
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          Set{" "}
          <code className="text-foreground">LUNA_SESSION_SECRET</code> in{" "}
          <code className="text-foreground">.env</code> (at least 16 chars) and
          restart the server.
        </p>
      ) : (
        <>
          <LoginForm nextPath={nextPath} />
          <div className="border-border relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-background relative z-10 px-2">or</span>
            <span className="border-border absolute inset-x-0 top-1/2 z-0 border-t" />
          </div>
          <Link
            href={tgHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center",
            )}
          >
            Sign in with Telegram
          </Link>
        </>
      )}
    </AuthPageShell>
  );
}
