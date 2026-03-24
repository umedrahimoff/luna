"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPanel =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        isAdminPanel
          ? "w-full max-w-none"
          : "mx-auto w-full max-w-5xl px-3 py-5 sm:px-5",
      )}
    >
      {children}
    </main>
  );
}
