"use client";

import { useActionState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/app/actions/events";
import { registerForEvent } from "@/app/actions/registrations";

type Props = {
  eventId: string;
  closed: boolean;
};

function fieldError(
  errors: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  return errors?.[key]?.[0];
}

export function RegisterForm({ eventId, closed }: Props) {
  const action = useMemo(
    () => registerForEvent.bind(null, eventId),
    [eventId],
  );
  const initial: ActionState = { ok: false };
  const [state, formAction, pending] = useActionState(action, initial);

  if (closed) {
    return (
      <p className="text-muted-foreground text-sm">
        Регистрация закрыта: достигнут лимит участников.
      </p>
    );
  }

  if (state.ok && state.message) {
    return (
      <Alert>
        <AlertTitle>Готово</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="reg-name">Имя</Label>
        <Input
          id="reg-name"
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          aria-invalid={!!fieldError(state.fieldErrors, "name")}
        />
        {fieldError(state.fieldErrors, "name") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "name")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          aria-invalid={!!fieldError(state.fieldErrors, "email")}
        />
        {fieldError(state.fieldErrors, "email") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "email")}
          </p>
        )}
      </div>
      {state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="mt-1 w-full sm:w-auto sm:min-w-44"
      >
        {pending ? "Отправка…" : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
