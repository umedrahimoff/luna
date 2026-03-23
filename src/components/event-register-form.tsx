"use client";

import { useActionState, useMemo } from "react";
import { registerForEvent } from "@/app/actions/registrations";
import { confirmMessages } from "@/lib/confirm-messages";
import type { ActionState } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = { ok: false };

type Props = {
  eventId: string | number;
  closed: boolean;
};

export function EventRegisterForm({ eventId, closed }: Props) {
  const action = useMemo(
    () => registerForEvent.bind(null, eventId),
    [eventId],
  );
  const [state, formAction, pending] = useActionState(action, initial);

  if (closed) {
    return (
      <p className="text-muted-foreground text-sm">
        Registration closed: capacity reached.
      </p>
    );
  }

  if (state.ok && state.message) {
    return <p className="text-primary text-sm font-medium">{state.message}</p>;
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessages.registerEvent)) {
          e.preventDefault();
        }
      }}
      className="flex max-w-md flex-col gap-3"
    >
      <div className="space-y-2">
        <Label htmlFor={`ev-reg-name-${eventId}`}>Name</Label>
        <Input
          id={`ev-reg-name-${eventId}`}
          name="name"
          required
          maxLength={120}
          autoComplete="name"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`ev-reg-email-${eventId}`}>Email</Label>
        <Input
          id={`ev-reg-email-${eventId}`}
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      {state.message ? (
        <p className="text-destructive text-sm">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Register"}
      </Button>
    </form>
  );
}
