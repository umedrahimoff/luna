"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import {
  clearProfileAvatar,
  uploadProfileAvatar,
  type ProfileActionState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: ProfileActionState = { ok: false };

type Props = {
  avatarUrl: string | null;
  initials: string;
  avatarBg: string;
};

export function ProfileAvatarEditor({ avatarUrl, initials, avatarBg }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(uploadProfileAvatar, initial);
  const [clearState, clearAction, clearPending] = useActionState(
    clearProfileAvatar,
    initial,
  );

  useEffect(() => {
    if (state.ok || clearState.ok) {
      router.refresh();
    }
  }, [state.ok, clearState.ok, router]);

  return (
    <div className="flex flex-col items-center gap-2 sm:items-end">
      <span className="text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-right">
        Profile picture
      </span>
      <div className="relative mx-auto size-28 sm:mx-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads from /public
          <img
            src={avatarUrl}
            alt=""
            width={112}
            height={112}
            className="size-28 rounded-full object-cover ring-2 ring-foreground/10"
          />
        ) : (
          <span
            className="flex size-28 items-center justify-center rounded-full text-xl font-semibold text-white shadow-inner ring-2 ring-white/10"
            style={{ backgroundColor: avatarBg }}
            aria-hidden
          >
            {initials}
          </span>
        )}
        <form
          ref={formRef}
          action={action}
          className="absolute right-0 bottom-0"
        >
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload profile picture"
            disabled={pending}
            onChange={() => {
              if (fileRef.current?.files?.length) {
                formRef.current?.requestSubmit();
              }
            }}
          />
          <button
            type="button"
            disabled={pending}
            className={cn(
              "bg-primary text-primary-foreground ring-background",
              "flex size-9 items-center justify-center rounded-full shadow-md ring-2",
              "hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            )}
            aria-label="Upload photo"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden />
          </button>
        </form>
      </div>
      {state.message && !state.ok ? (
        <p className="text-destructive max-w-[12rem] text-center text-xs">
          {state.message}
        </p>
      ) : null}
      {avatarUrl ? (
        <form action={clearAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-auto py-1 text-xs"
            disabled={clearPending}
          >
            {clearPending ? "Removing…" : "Remove photo"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
