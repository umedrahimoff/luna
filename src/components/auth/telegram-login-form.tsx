"use client";

import { useActionState, useMemo, useState } from "react";
import {
  loginWithTelegramCode,
  requestTelegramLoginCode,
  type TelegramAuthState,
} from "@/app/actions/telegram-auth";
import { loginUser, type AuthState } from "@/app/actions/user-auth";
import {
  authGhostButtonClass,
  authInputClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-fields";
import { cn } from "@/lib/utils";

const tgInitial: TelegramAuthState = { ok: false };
const pwInitial: AuthState = { ok: false };

type Props = { nextPath?: string };

export function TelegramLoginForm({ nextPath }: Props) {
  const [mode, setMode] = useState<"code" | "password">("code");

  const reqAction = useMemo(() => requestTelegramLoginCode, []);
  const [reqState, reqFormAction, reqPending] = useActionState(
    reqAction,
    tgInitial,
  );

  const loginTgAction = useMemo(() => loginWithTelegramCode, []);
  const [tgState, tgFormAction, tgPending] = useActionState(
    loginTgAction,
    tgInitial,
  );

  const loginPwAction = useMemo(() => loginUser, []);
  const [pwState, pwFormAction, pwPending] = useActionState(
    loginPwAction,
    pwInitial,
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-zinc-400 text-sm">Код придёт в Telegram</p>

      <div
        className="flex rounded-full border border-zinc-700 bg-zinc-900/50 p-1"
        role="tablist"
        aria-label="Способ входа"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "code"}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            mode === "code"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200",
          )}
          onClick={() => setMode("code")}
        >
          Код
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            mode === "password"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200",
          )}
          onClick={() => setMode("password")}
        >
          Пароль
        </button>
      </div>

      {mode === "code" ? (
        <div className="flex flex-col gap-4">
          <form action={reqFormAction} className="flex flex-col gap-3">
            <div className="space-y-2">
              <label
                htmlFor="tl-login-req"
                className="text-zinc-100 text-sm font-medium"
              >
                Логин
              </label>
              <input
                id="tl-login-req"
                name="login"
                required
                autoComplete="username"
                placeholder="admin"
                className={authInputClass}
              />
            </div>
            {reqState.message && !reqState.ok ? (
              <p className="text-red-400 text-sm">{reqState.message}</p>
            ) : null}
            {reqState.ok && reqState.message ? (
              <p className="text-emerald-400/90 text-sm">{reqState.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={reqPending}
              className={authPrimaryButtonClass}
            >
              {reqPending ? "Отправка…" : "Отправить код в Telegram"}
            </button>
          </form>

          <form action={tgFormAction} className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
            {nextPath ? (
              <input type="hidden" name="next" value={nextPath} />
            ) : null}
            <div className="space-y-2">
              <label
                htmlFor="tl-login-code"
                className="text-zinc-100 text-sm font-medium"
              >
                Логин
              </label>
              <input
                id="tl-login-code"
                name="login"
                required
                autoComplete="username"
                placeholder="admin"
                className={authInputClass}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="tl-code"
                className="text-zinc-100 text-sm font-medium"
              >
                Код из Telegram
              </label>
              <input
                id="tl-code"
                name="code"
                required
                autoComplete="one-time-code"
                placeholder="Код"
                className={authInputClass}
              />
            </div>
            {tgState.message && !tgState.ok ? (
              <p className="text-red-400 text-sm">{tgState.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={tgPending}
              className={authGhostButtonClass}
            >
              {tgPending ? "Вход…" : "Войти по коду"}
            </button>
          </form>
        </div>
      ) : (
        <form action={pwFormAction} className="flex flex-col gap-3">
          {nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}
          <div className="space-y-2">
            <label
              htmlFor="tl-pw-login"
              className="text-zinc-100 text-sm font-medium"
            >
              Логин или email
            </label>
            <input
              id="tl-pw-login"
              name="login"
              required
              autoComplete="username"
              placeholder="admin"
              className={authInputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="tl-pw"
              className="text-zinc-100 text-sm font-medium"
            >
              Пароль
            </label>
            <input
              id="tl-pw"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={authInputClass}
            />
          </div>
          {pwState.message ? (
            <p className="text-red-400 text-sm">{pwState.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={pwPending}
            className={authPrimaryButtonClass}
          >
            {pwPending ? "Вход…" : "Войти"}
          </button>
        </form>
      )}
    </div>
  );
}
