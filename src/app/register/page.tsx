import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/signup-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";
import { cn } from "@/lib/utils";

export const metadata = { title: "Sign up — Luna" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const configured = userSessionConfigured();

  return (
    <AuthPageShell>
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Sign up
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium underline">
            Sign in
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
          <SignupForm />
          <div className="border-border relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-background relative z-10 px-2">or</span>
            <span className="border-border absolute inset-x-0 top-1/2 z-0 border-t" />
          </div>
          <Link
            href="/auth/telegram/register"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center",
            )}
          >
            Sign up with Telegram
          </Link>
        </>
      )}
    </AuthPageShell>
  );
}
