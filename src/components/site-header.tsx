import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  showAdminLink?: boolean;
};

export function SiteHeader({ showAdminLink = false }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Luna
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            События
          </Link>
          <Link
            href="/me"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Мои события
          </Link>
          <Link
            href="/events/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Создать
          </Link>
          {showAdminLink ? (
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Админ
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
