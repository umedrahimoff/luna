"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";
  const isAdminPanel =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        isAdminPanel
          ? "w-full max-w-none"
          : isAuth
            ? "dark mx-auto w-full max-w-md bg-black px-4 py-8 text-zinc-100 sm:px-6"
            : "mx-auto w-full max-w-3xl px-3 py-5 sm:px-5",
      )}
    >
      {children}
    </main>
  );
}
