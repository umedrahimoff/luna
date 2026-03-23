"use client";

import { useActionState, useMemo } from "react";
import { registerUser, type AuthState } from "@/app/actions/user-auth";
import { confirmMessages } from "@/lib/confirm-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { ok: false };

export function SignupForm() {
  const action = useMemo(() => registerUser, []);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessages.signUp)) {
          e.preventDefault();
        }
      }}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      <div className="w-full space-y-2">
        <Label htmlFor="reg-name">Name</Label>
        <Input id="reg-name" name="name" required maxLength={120} autoComplete="name" />
      </div>
      <div className="w-full space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="w-full space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-muted-foreground text-xs">At least 8 characters</p>
      </div>
      {state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
