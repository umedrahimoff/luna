"use client";

import { useActionState, useMemo } from "react";
import {
  registerWithTelegramCode,
  type TelegramAuthState,
} from "@/app/actions/telegram-auth";
import { authInputClass, authPrimaryButtonClass } from "@/components/auth/auth-fields";

const initial: TelegramAuthState = { ok: false };

export function TelegramRegisterForm() {
  const action = useMemo(() => registerWithTelegramCode, []);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <p className="text-zinc-400 text-sm leading-relaxed">
        Отправьте <span className="text-zinc-200">/start</span> боту{" "}
        <a
          href="https://t.me/getlunabot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-100 underline underline-offset-2"
        >
          @getlunabot
        </a>{" "}
        в Telegram, получите код и введите его ниже.
      </p>
      <div className="space-y-2">
        <label htmlFor="tg-code" className="text-zinc-100 text-sm font-medium">
          Код из Telegram
        </label>
        <input
          id="tg-code"
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="ABC12345"
          className={authInputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="tg-login" className="text-zinc-100 text-sm font-medium">
          Логин
        </label>
        <input
          id="tg-login"
          name="login"
          required
          autoComplete="username"
          placeholder="admin"
          className={authInputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tg-fn" className="text-zinc-100 text-sm font-medium">
            Имя
          </label>
          <input
            id="tg-fn"
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Иван"
            className={authInputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="tg-ln" className="text-zinc-100 text-sm font-medium">
            Фамилия
          </label>
          <input
            id="tg-ln"
            name="lastName"
            autoComplete="family-name"
            placeholder="Иванов"
            className={authInputClass}
          />
        </div>
      </div>
      {state.message && !state.ok ? (
        <p className="text-red-400 text-sm">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
        {pending ? "Регистрация…" : "Зарегистрироваться"}
      </button>
    </form>
  );
}
