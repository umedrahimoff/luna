"use client";

import { useActionState, useMemo } from "react";
import { loginUser, type AuthState } from "@/app/actions/user-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { ok: false };

type Props = { nextPath?: string };

export function LoginForm({ nextPath }: Props) {
  const action = useMemo(() => loginUser, []);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      {nextPath ? (
        <input type="hidden" name="next" value={nextPath} />
      ) : null}
      <div className="w-full space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="w-full space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
