import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export const metadata = { title: "Sign up — Luna" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const configured = userSessionConfigured();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-5 py-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sign up</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-muted-foreground text-sm">
          Set <code className="text-foreground">LUNA_SESSION_SECRET</code> in{" "}
          <code className="text-foreground">.env</code> (at least 16 characters)
          and restart the server.
        </p>
      ) : (
        <SignupForm />
      )}
    </div>
  );
}
