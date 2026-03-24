import Link from "next/link";
import { PublicEventList } from "@/components/public-event-list";
import { buttonVariants } from "@/components/ui/button-variants";
import { getSessionUser } from "@/lib/user-session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { category?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category: categorySlug } = await searchParams;
  const user = await getSessionUser();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          {user
            ? "Events you have registered for (matched by your account email)."
            : "Sign in to see events you have registered for."}
        </p>
      </div>

      {user ? (
        <PublicEventList
          categorySlug={categorySlug}
          listBasePath="/"
          registeredEmail={user.email ?? undefined}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/login?next=/"
            className={cn(buttonVariants({ size: "sm" }), "w-fit")}
          >
            Sign in
          </Link>
          <Link
            href="/discover"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit",
            )}
          >
            Discover all events
          </Link>
        </div>
      )}
    </div>
  );
}
