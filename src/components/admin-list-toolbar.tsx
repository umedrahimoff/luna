import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  /** GET form action (same list route). */
  action: string;
  defaultQuery?: string;
  placeholder?: string;
  /** Selects and hidden fields in the same form as search. */
  filters?: React.ReactNode;
  resetHref?: string;
  /** Show Reset when filters are active or q is non-empty. */
  showReset?: boolean;
  /** No extra card frame — use inside another panel. */
  plain?: boolean;
  className?: string;
};

/** Single row: search + optional filters (GET) so params are preserved. */
export function AdminListToolbar({
  action,
  defaultQuery = "",
  placeholder = "Search…",
  filters,
  resetHref,
  showReset,
  plain = false,
  className,
}: Props) {
  return (
    <form
      method="get"
      action={action}
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
        !plain && "bg-card rounded-xl border p-3 ring-1 ring-black/5",
        className,
      )}
    >
      <div className="flex min-w-[min(100%,12rem)] flex-1 flex-col gap-1.5">
        <Label htmlFor="admin-list-q" className="text-xs">
          Search
        </Label>
        <div className="flex gap-2">
          <Input
            id="admin-list-q"
            name="q"
            type="search"
            defaultValue={defaultQuery}
            placeholder={placeholder}
            className="min-w-0 flex-1"
            autoComplete="off"
          />
          <Button type="submit" variant="secondary" size="sm" className="shrink-0">
            Find
          </Button>
        </div>
      </div>
      {filters}
      {showReset && resetHref ? (
        <Link
          href={resetHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-9 self-end sm:mb-0.5",
          )}
        >
          Reset
        </Link>
      ) : null}
    </form>
  );
}
