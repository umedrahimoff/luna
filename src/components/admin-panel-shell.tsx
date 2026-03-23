"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/actions/admin-auth";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/events", label: "События" },
  { href: "/admin/categories", label: "Категории" },
] as const;

export function AdminPanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Luna
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Панель администратора
          </h1>
        </div>
        <form action={adminLogout}>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Выйти
          </button>
        </form>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              buttonVariants({
                variant: pathname === l.href ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          На сайт
        </Link>
      </nav>
      {children}
    </div>
  );
}
