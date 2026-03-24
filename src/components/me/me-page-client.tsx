"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { Event } from "@prisma/client";
import { CheckCircle2, UserRoundPen } from "lucide-react";
import {
  changePassword,
  deleteAccount,
  updateProfile,
  type ProfileActionState,
} from "@/app/actions/profile";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileAvatarEditor } from "@/components/me/profile-avatar-editor";
import { useTheme } from "@/components/theme-provider";
import { joinDisplayName } from "@/lib/display-name";
import { avatarBackgroundFromEmail, initialsFromName } from "@/lib/avatar-style";
import { cn } from "@/lib/utils";

type Tab = "events" | "account" | "settings";

type EventListItem = Pick<
  Event,
  | "id"
  | "publicCode"
  | "title"
  | "startsAt"
  | "endsAt"
  | "format"
  | "location"
  | "capacity"
  | "coverImageUrl"
> & {
  category: { name: string } | null;
  _count: { registrations: number };
};

type Props = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  events: EventListItem[];
};

const profileInitial: ProfileActionState = { ok: false };
const passwordInitial: ProfileActionState = { ok: false };
const deleteInitial: ProfileActionState = { ok: false };

function fieldErr(
  fe: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  return fe?.[key]?.[0];
}

export function MePageClient({ user, events }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const tabParam = sp.get("tab");
  /** Default: Account; supports `?tab=events` and `?tab=settings`. */
  const tab: Tab =
    tabParam === "events"
      ? "events"
      : tabParam === "settings"
        ? "settings"
        : "account";

  const setTab = (next: Tab) => {
    const q = new URLSearchParams(sp.toString());
    if (next === "account") q.delete("tab");
    else if (next === "events") q.set("tab", "events");
    else q.set("tab", "settings");
    const s = q.toString();
    router.replace(s ? `/me?${s}` : "/me", { scroll: false });
  };

  const displayNameForInitials = joinDisplayName(
    user.firstName,
    user.lastName,
  );
  const initials = initialsFromName(
    displayNameForInitials || user.firstName || "?",
  );
  const avatarBg = avatarBackgroundFromEmail(user.email);

  const profileFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    profileInitial,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    passwordInitial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccount,
    deleteInitial,
  );

  const [confirmProfile, setConfirmProfile] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("en");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (profileState.ok) {
      setConfirmProfile(false);
      router.refresh();
    }
  }, [profileState.ok, router]);
  useEffect(() => {
    if (passwordState.ok) setConfirmPassword(false);
  }, [passwordState.ok]);
  useEffect(() => {
    setMounted(true);
  }, []);

  const profileKey = useMemo(
    () =>
      `${user.firstName}|${user.lastName}|${user.email}|${user.bio ?? ""}|${user.username ?? ""}|${user.avatarUrl ?? ""}`,
    [
      user.firstName,
      user.lastName,
      user.email,
      user.bio,
      user.username,
      user.avatarUrl,
    ],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage how you appear as a host and your sign-in details.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="border-border flex gap-1 border-b"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "account"}
          className={cn(
            "relative -mb-px px-3 py-2.5 text-sm font-medium transition-colors",
            tab === "account"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("account")}
        >
          Account
          {tab === "account" ? (
            <span className="bg-primary absolute inset-x-1 -bottom-px h-0.5 rounded-full" />
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "events"}
          className={cn(
            "relative -mb-px px-3 py-2.5 text-sm font-medium transition-colors",
            tab === "events"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("events")}
        >
          My events
          {tab === "events" ? (
            <span className="bg-primary absolute inset-x-1 -bottom-px h-0.5 rounded-full" />
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "settings"}
          className={cn(
            "relative -mb-px px-3 py-2.5 text-sm font-medium transition-colors",
            tab === "settings"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("settings")}
        >
          Settings
          {tab === "settings" ? (
            <span className="bg-primary absolute inset-x-1 -bottom-px h-0.5 rounded-full" />
          ) : null}
        </button>
      </div>

      {tab === "events" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Events you host (newest first in the list below).
            </p>
            <Link
              href="/events/new"
              className={cn(buttonVariants({ size: "sm" }), "w-fit shrink-0")}
            >
              New event
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You have no events yet.{" "}
              <Link href="/events/new" className="text-primary underline">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {events.map((e) => (
                <li key={e.id} className="flex flex-col gap-2">
                  <EventCard
                    event={{
                      ...e,
                      category: e.category,
                    }}
                    registeredCount={e._count.registrations}
                    capacity={e.capacity}
                  />
                  <Link
                    href={`/${e.publicCode}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-fit",
                    )}
                  >
                    Edit event
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : tab === "settings" ? (
        <Card>
          <CardHeader className="border-border border-b p-4 sm:p-5">
            <CardTitle>Display</CardTitle>
            <CardDescription>
              Choose your desired Luna interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4 pt-4 sm:p-5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {([
                { key: "system", label: "System" },
                { key: "light", label: "Light" },
                { key: "dark", label: "Dark" },
              ] as const).map((opt) => (
                <div key={opt.key} className="relative">
                  {mounted && theme === opt.key ? (
                    <span className="bg-foreground text-background absolute right-2 bottom-2 z-10 inline-flex size-5 items-center justify-center rounded-full">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                    </span>
                  ) : null}
                <button
                  type="button"
                  onClick={() => setTheme(opt.key)}
                  className={cn(
                    "border-border bg-card hover:bg-accent/40 w-full rounded-xl border p-2.5 text-left transition-colors",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 h-12 rounded-md border",
                      opt.key === "dark"
                        ? "border-neutral-800 bg-neutral-900"
                        : opt.key === "light"
                          ? "border-neutral-200 bg-neutral-100"
                          : "border-neutral-300 bg-gradient-to-r from-neutral-100 to-neutral-900",
                    )}
                  />
                  <p className="text-sm font-medium">{opt.label}</p>
                </button>
                </div>
              ))}
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="settings-language">Language</Label>
              <select
                id="settings-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled
                className={cn(
                  "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-60",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
                )}
              >
                <option value="en">English</option>
              </select>
              <p className="text-muted-foreground text-xs">More languages soon.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-border border-b p-4 sm:p-5">
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                Choose how you are displayed as a host or guest. Add a username
                to publish at{" "}
                <span className="text-foreground font-mono text-[0.8rem]">
                  /u/yourname
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-4 sm:p-5">
              {user.username ? (
                <p className="text-muted-foreground mb-3 text-sm">
                  <Link
                    href={`/u/${user.username}`}
                    className="text-primary font-medium underline underline-offset-4"
                  >
                    View public profile
                  </Link>
                </p>
              ) : null}
              <form
                key={profileKey}
                ref={profileFormRef}
                action={profileAction}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-6">
                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-first-name">First name</Label>
                      <Input
                        id="profile-first-name"
                        name="firstName"
                        required
                        maxLength={60}
                        autoComplete="given-name"
                        defaultValue={user.firstName}
                        aria-invalid={!!fieldErr(
                          profileState.fieldErrors,
                          "firstName",
                        )}
                      />
                      {fieldErr(profileState.fieldErrors, "firstName") ? (
                        <p className="text-destructive text-xs">
                          {fieldErr(profileState.fieldErrors, "firstName")}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-last-name">Last name</Label>
                      <Input
                        id="profile-last-name"
                        name="lastName"
                        maxLength={60}
                        autoComplete="family-name"
                        defaultValue={user.lastName}
                        aria-invalid={!!fieldErr(
                          profileState.fieldErrors,
                          "lastName",
                        )}
                      />
                      {fieldErr(profileState.fieldErrors, "lastName") ? (
                        <p className="text-destructive text-xs">
                          {fieldErr(profileState.fieldErrors, "lastName")}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-username">Username</Label>
                      <div className="flex min-w-0 rounded-lg border border-input shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
                        <span className="text-muted-foreground border-input bg-muted/50 flex shrink-0 items-center border-r px-3 text-sm">
                          @
                        </span>
                        <Input
                          id="profile-username"
                          name="username"
                          autoComplete="username"
                          placeholder="your_handle"
                          defaultValue={user.username ?? ""}
                          className="border-0 shadow-none focus-visible:ring-0 md:text-sm"
                          aria-invalid={!!fieldErr(
                            profileState.fieldErrors,
                            "username",
                          )}
                        />
                      </div>
                      {fieldErr(profileState.fieldErrors, "username") ? (
                        <p className="text-destructive text-xs">
                          {fieldErr(profileState.fieldErrors, "username")}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          3–30 chars: lowercase letters, numbers, underscores.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={user.email}
                        aria-invalid={!!fieldErr(
                          profileState.fieldErrors,
                          "email",
                        )}
                      />
                      {fieldErr(profileState.fieldErrors, "email") ? (
                        <p className="text-destructive text-xs">
                          {fieldErr(profileState.fieldErrors, "email")}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          Used for sign-in and event notifications.
                        </p>
                      )}
                    </div>
                  </div>
                  <ProfileAvatarEditor
                    avatarUrl={user.avatarUrl}
                    initials={initials}
                    avatarBg={avatarBg}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    id="profile-bio"
                    name="bio"
                    rows={4}
                    maxLength={2000}
                    placeholder="Share a little about your background and interests."
                    defaultValue={user.bio ?? ""}
                    className="min-h-[100px] resize-y"
                    aria-invalid={!!fieldErr(profileState.fieldErrors, "bio")}
                  />
                  {fieldErr(profileState.fieldErrors, "bio") ? (
                    <p className="text-destructive text-xs">
                      {fieldErr(profileState.fieldErrors, "bio")}
                    </p>
                  ) : null}
                </div>
                {profileState.message ? (
                  <p
                    className={cn(
                      "text-sm",
                      profileState.ok
                        ? "text-primary font-medium"
                        : "text-destructive",
                    )}
                  >
                    {profileState.message}
                  </p>
                ) : null}
                <div className="flex justify-start">
                  <Button
                    type="button"
                    className="gap-2"
                    disabled={profilePending}
                    onClick={() => setConfirmProfile(true)}
                  >
                    <UserRoundPen className="size-4" aria-hidden />
                    {profilePending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border border-b p-4 sm:p-5">
              <CardTitle>Security</CardTitle>
              <CardDescription>
                For your security, use a strong password you do not reuse
                elsewhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-4 sm:p-5">
              <form
                ref={passwordFormRef}
                action={passwordAction}
                className="flex max-w-md flex-col gap-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="current-pw">Current password</Label>
                  <Input
                    id="current-pw"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      !!fieldErr(passwordState.fieldErrors, "currentPassword")
                    }
                  />
                  {fieldErr(passwordState.fieldErrors, "currentPassword") ? (
                    <p className="text-destructive text-xs">
                      {fieldErr(passwordState.fieldErrors, "currentPassword")}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input
                    id="new-pw"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    aria-invalid={
                      !!fieldErr(passwordState.fieldErrors, "newPassword")
                    }
                  />
                  {fieldErr(passwordState.fieldErrors, "newPassword") ? (
                    <p className="text-destructive text-xs">
                      {fieldErr(passwordState.fieldErrors, "newPassword")}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm new password</Label>
                  <Input
                    id="confirm-pw"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={
                      !!fieldErr(passwordState.fieldErrors, "confirmPassword")
                    }
                  />
                  {fieldErr(passwordState.fieldErrors, "confirmPassword") ? (
                    <p className="text-destructive text-xs">
                      {fieldErr(passwordState.fieldErrors, "confirmPassword")}
                    </p>
                  ) : null}
                </div>
                {passwordState.message ? (
                  <p
                    className={cn(
                      "text-sm",
                      passwordState.ok
                        ? "text-primary font-medium"
                        : "text-destructive",
                    )}
                  >
                    {passwordState.message}
                  </p>
                ) : null}
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={passwordPending}
                    onClick={() => setConfirmPassword(true)}
                  >
                    {passwordPending ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/40 ring-destructive/20">
            <CardHeader className="border-border border-b p-4 sm:p-5">
              <CardTitle className="text-destructive">Delete account</CardTitle>
              <CardDescription>
                Permanently remove your account and all events you host. This
                cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-4 sm:p-5">
              <form
                ref={deleteFormRef}
                action={deleteAction}
                className="flex max-w-md flex-col gap-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="delete-pw">Password</Label>
                  <Input
                    id="delete-pw"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      !!fieldErr(deleteState.fieldErrors, "password")
                    }
                  />
                  {fieldErr(deleteState.fieldErrors, "password") ? (
                    <p className="text-destructive text-xs">
                      {fieldErr(deleteState.fieldErrors, "password")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Enter your password to confirm you own this account.
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-border flex flex-col items-stretch gap-2 border-t bg-transparent p-4 sm:flex-row sm:justify-start sm:p-5">
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                disabled={deletePending}
                onClick={() => setConfirmDelete(true)}
              >
                Delete my account
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmProfile}
        onOpenChange={setConfirmProfile}
        title="Save profile?"
        description="Your display name, email, and bio will be updated."
        confirmLabel="Save"
        pending={profilePending}
        onConfirm={() => {
          if (!profileFormRef.current) return;
          profileAction(new FormData(profileFormRef.current));
        }}
      />

      <ConfirmDialog
        open={confirmPassword}
        onOpenChange={setConfirmPassword}
        title="Update password?"
        description="You will use the new password the next time you sign in."
        confirmLabel="Update password"
        pending={passwordPending}
        onConfirm={() => {
          if (!passwordFormRef.current) return;
          passwordAction(new FormData(passwordFormRef.current));
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="destructive"
        title="Delete your account?"
        description="All events you created will be removed. Registrations for those events will be deleted. This action is permanent."
        confirmLabel="Delete account"
        pending={deletePending}
        onConfirm={() => {
          if (!deleteFormRef.current) return;
          deleteAction(new FormData(deleteFormRef.current));
        }}
      />
    </div>
  );
}
