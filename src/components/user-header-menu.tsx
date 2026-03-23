"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logoutUser } from "@/app/actions/user-auth";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  name: string;
  email: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function avatarBackground(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i += 1) {
    h = email.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  return `oklch(0.52 0.14 ${hue})`;
}

function handleFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || "user";
  return `@${local}`;
}

const menuItemClass =
  "text-foreground hover:bg-accent focus:bg-accent block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium outline-none";

type Props = {
  user: HeaderUser;
  showAdminLink: boolean;
};

export function UserHeaderMenu({ user, showAdminLink }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = initialsFromName(user.name);
  const bg = avatarBackground(user.email);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="ring-offset-background focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white shadow-inner"
          style={{ backgroundColor: bg }}
          title={user.email}
        >
          {initials}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className="bg-popover text-popover-foreground border-border absolute right-0 z-50 mt-2 min-w-[14rem] rounded-xl border py-2 shadow-lg ring-1 ring-black/5"
        >
          <div className="border-border border-b px-3 pb-3 pt-1">
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: bg }}
                aria-hidden
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {handleFromEmail(user.email)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 px-1.5 pt-2 pb-1">
            <Link
              href="/me"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              View profile
            </Link>
            <Link
              href="/me"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            {showAdminLink ? (
              <Link
                href="/admin"
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            ) : null}
          </div>
          <div className="border-border mt-1 border-t px-1.5 pt-1 pb-1">
            <form action={logoutUser}>
              <button
                type="submit"
                role="menuitem"
                className={cn(menuItemClass, "text-destructive hover:bg-destructive/10")}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
