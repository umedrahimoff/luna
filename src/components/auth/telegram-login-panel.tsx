"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  completeTelegramLogin,
  requestTelegramLoginCode,
  type TelegramAuthState,
} from "@/app/actions/telegram-auth";
import { loginUser, type AuthState } from "@/app/actions/user-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

const tgInitial: TelegramAuthState = { ok: false };
const pwdInitial: AuthState = { ok: false };

type Mode = "code" | "password";

type Props = { nextPath?: string };

function fieldErr(
  fe: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  return fe?.[key]?.[0];
}

export function TelegramLoginPanel({ nextPath }: Props) {
  const t = useI18n();
  const [mode, setMode] = useState<Mode>("code");
  const [loginSlug, setLoginSlug] = useState("");

  const reqAction = useMemo(() => requestTelegramLoginCode, []);
  const [reqState, reqFormAction, reqPending] = useActionState(
    reqAction,
    tgInitial,
  );

  const completeAction = useMemo(() => completeTelegramLogin, []);
  const [loginState, completeFormAction, completePending] = useActionState(
    completeAction,
    tgInitial,
  );

  const pwdAction = useMemo(() => loginUser, []);
  const [pwdState, pwdFormAction, pwdPending] = useActionState(
    pwdAction,
    pwdInitial,
  );

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label={t.telegram.method}
        className="bg-muted/50 border-border flex gap-1 rounded-xl border p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "code"}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            mode === "code"
              ? "bg-background text-foreground ring-foreground/10 shadow-sm ring-1"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("code")}
        >
          {t.telegram.code}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            mode === "password"
              ? "bg-background text-foreground ring-foreground/10 shadow-sm ring-1"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("password")}
        >
          {t.telegram.password}
        </button>
      </div>

      {mode === "code" ? (
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {t.telegram.codeHint}
          </p>

          <form action={reqFormAction} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="tg-login-slug">{t.telegram.login}</Label>
              <Input
                id="tg-login-slug"
                name="loginSlug"
                required
                value={loginSlug}
                onChange={(e) => setLoginSlug(e.target.value)}
                autoComplete="username"
                placeholder="ivan_petrov"
                className="font-mono text-sm"
                aria-invalid={!!fieldErr(reqState.fieldErrors, "loginSlug")}
              />
              {fieldErr(reqState.fieldErrors, "loginSlug") ? (
                <p className="text-destructive text-xs">
                  {fieldErr(reqState.fieldErrors, "loginSlug")}
                </p>
              ) : null}
            </div>
            {reqState.message ? (
              <p
                className={cn(
                  "text-sm",
                  reqState.ok ? "text-primary font-medium" : "text-destructive",
                )}
              >
                {reqState.message}
              </p>
            ) : null}
            <Button type="submit" disabled={reqPending} className="w-full">
              {reqPending ? "Sending…" : t.telegram.sendCode}
            </Button>
          </form>

          <form action={completeFormAction} className="flex flex-col gap-4">
            {nextPath ? (
              <input type="hidden" name="next" value={nextPath} />
            ) : null}
            <input type="hidden" name="loginSlug" value={loginSlug} />
            <div className="space-y-2">
              <Label htmlFor="tg-login-code">{t.telegram.telegramCode}</Label>
              <Input
                id="tg-login-code"
                name="code"
                required
                autoComplete="one-time-code"
                placeholder={t.telegram.enterCode}
                className="font-mono uppercase"
                aria-invalid={!!fieldErr(loginState.fieldErrors, "code")}
              />
              {fieldErr(loginState.fieldErrors, "code") ? (
                <p className="text-destructive text-xs">
                  {fieldErr(loginState.fieldErrors, "code")}
                </p>
              ) : null}
            </div>
            {loginState.message && !loginState.ok ? (
              <p className="text-destructive text-sm">{loginState.message}</p>
            ) : null}
            <Button type="submit" disabled={completePending} className="w-full">
              {completePending ? t.auth.signingIn : t.auth.signInLink}
            </Button>
          </form>
        </div>
      ) : (
        <form action={pwdFormAction} className="flex flex-col gap-3">
          {nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}
          <p className="text-muted-foreground text-sm">
            {t.telegram.passwordHint}
          </p>
          <div className="space-y-2">
            <Label htmlFor="pwd-email">{t.auth.email}</Label>
            <Input
              id="pwd-email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd-pass">{t.auth.password}</Label>
            <Input
              id="pwd-pass"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {pwdState.message ? (
            <p className="text-destructive text-sm">{pwdState.message}</p>
          ) : null}
          <Button type="submit" disabled={pwdPending} className="w-full">
            {pwdPending ? t.auth.signingIn : t.auth.signInLink}
          </Button>
        </form>
      )}

      <p className="text-muted-foreground text-center text-sm">
        {t.telegram.noAccount}{" "}
        <Link href="/register" className="text-primary font-medium underline">
          {t.telegram.signUp}
        </Link>
      </p>

      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-muted-foreground self-center",
        )}
      >
        {t.telegram.regularSignIn}
      </Link>
    </div>
  );
}
