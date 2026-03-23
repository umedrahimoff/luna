import { cn } from "@/lib/utils";

/** Form / card in the main column: full width from sidebar to the technical aside. */
export const adminDetailFormCardClass =
  "bg-card flex w-full min-w-0 flex-col gap-2.5 rounded-xl border p-4 ring-1 ring-black/5";

export const adminDetailFormCardClassComfortable =
  "bg-card flex w-full min-w-0 flex-col gap-3 rounded-xl border p-4 ring-1 ring-black/5";

/**
 * Master–detail: main column fills space between nav and the right metadata panel (~18rem).
 */
export function AdminEntityLayout({
  main,
  aside,
  className,
}: {
  main: React.ReactNode;
  aside: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8",
        className,
      )}
    >
      <div className="min-w-0 w-full flex-1">{main}</div>
      <aside className="border-border bg-card text-card-foreground ring-border/60 w-full shrink-0 rounded-xl border p-4 text-xs shadow-sm ring-1 lg:sticky lg:top-4 lg:w-72 lg:self-start">
        {aside}
      </aside>
    </div>
  );
}
