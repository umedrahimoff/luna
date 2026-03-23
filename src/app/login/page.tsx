import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

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

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-5 py-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          No account?{" "}
          <Link href="/register" className="text-primary font-medium underline">
            Sign up
          </Link>
          — then you can create events and register for them.
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          Set <code className="text-foreground">LUNA_SESSION_SECRET</code> in{" "}
          <code className="text-foreground">.env</code> (at least 16 characters)
          and restart the server.
        </p>
      ) : (
        <LoginForm nextPath={nextPath} />
      )}
    </div>
  );
}
