"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logoutUser } from "@/app/actions/user-auth";
import { avatarBackgroundFromEmail, initialsFromName } from "@/lib/avatar-style";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  name: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
};

function UserAvatar({
  user,
  sizeClass,
  textClass,
}: {
  user: HeaderUser;
  sizeClass: string;
  textClass: string;
}) {
  const initials = initialsFromName(user.name);
  const bg = avatarBackgroundFromEmail(user.email);
  if (user.avatarUrl) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-full ring-1 ring-black/10",
          sizeClass,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt=""
          className="size-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-inner",
        sizeClass,
        textClass,
      )}
      style={{ backgroundColor: bg }}
    >
      {initials}
    </span>
  );
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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="ring-offset-background focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        title={user.email}
      >
        <UserAvatar
          user={user}
          sizeClass="size-9"
          textClass="text-xs"
        />
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
              <UserAvatar
                user={user}
                sizeClass="size-11"
                textClass="text-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {handleFromEmail(user.email)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 px-1.5 pt-2 pb-1">
            {user.username ? (
              <Link
                href={`/u/${user.username}`}
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                Public profile
              </Link>
            ) : null}
            <Link
              href="/me"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              Profile & settings
            </Link>
            <Link
              href="/me?tab=events"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              My events
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
