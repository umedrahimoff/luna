"use client";

import { useActionState, useMemo } from "react";
import Link from "next/link";
import {
  registerWithTelegram,
  type TelegramAuthState,
} from "@/app/actions/telegram-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LUNA_TELEGRAM_BOT_URL } from "@/lib/telegram-constants";

const initial: TelegramAuthState = { ok: false };

function fieldErr(
  fe: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  return fe?.[key]?.[0];
}

export function TelegramRegisterForm() {
  const action = useMemo(() => registerWithTelegram, []);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex w-full min-w-0 flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Send{" "}
        <code className="text-foreground bg-muted rounded px-1 py-0.5 text-xs">
          /start
        </code>{" "}
        to bot{" "}
        <a
          href={LUNA_TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium underline underline-offset-4"
        >
          @getlunabot
        </a>{" "}
        in Telegram, get a code, then enter it below.
      </p>

      <div className="space-y-2">
        <Label htmlFor="tg-reg-code">Telegram code</Label>
        <Input
          id="tg-reg-code"
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="ABC12345"
          className="font-mono uppercase"
          aria-invalid={!!fieldErr(state.fieldErrors, "code")}
        />
        {fieldErr(state.fieldErrors, "code") ? (
          <p className="text-destructive text-xs">
            {fieldErr(state.fieldErrors, "code")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tg-reg-login">Login</Label>
        <Input
          id="tg-reg-login"
          name="loginSlug"
          required
          autoComplete="username"
          placeholder="ivan_petrov"
          className="font-mono text-sm"
          aria-invalid={!!fieldErr(state.fieldErrors, "loginSlug")}
        />
        {fieldErr(state.fieldErrors, "loginSlug") ? (
          <p className="text-destructive text-xs">
            {fieldErr(state.fieldErrors, "loginSlug")}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Latin letters, numbers, and underscore, 3-30 chars.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tg-reg-fn">First name</Label>
          <Input
            id="tg-reg-fn"
            name="firstName"
            required
            maxLength={60}
            autoComplete="given-name"
            placeholder="Ivan"
            aria-invalid={!!fieldErr(state.fieldErrors, "firstName")}
          />
          {fieldErr(state.fieldErrors, "firstName") ? (
            <p className="text-destructive text-xs">
              {fieldErr(state.fieldErrors, "firstName")}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tg-reg-ln">Last name</Label>
          <Input
            id="tg-reg-ln"
            name="lastName"
            maxLength={60}
            autoComplete="family-name"
            placeholder="Petrov"
            aria-invalid={!!fieldErr(state.fieldErrors, "lastName")}
          />
          {fieldErr(state.fieldErrors, "lastName") ? (
            <p className="text-destructive text-xs">
              {fieldErr(state.fieldErrors, "lastName")}
            </p>
          ) : null}
        </div>
      </div>

      {state.message && !state.ok ? (
        <p className="text-destructive text-sm">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing up…" : "Sign up"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
