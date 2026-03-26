"use client";

import { useActionState, useMemo } from "react";
import { registerUser, type AuthState } from "@/app/actions/user-auth";
import { confirmMessages } from "@/lib/confirm-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { ok: false };

type I18nAuth = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  minPassword: string;
  creatingAccount: string;
  signUpTitle?: string;
};

export function SignupForm({ t }: { t: I18nAuth }) {
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reg-fn">{t.firstName}</Label>
          <Input
            id="reg-fn"
            name="firstName"
            required
            maxLength={60}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-ln">{t.lastName}</Label>
          <Input
            id="reg-ln"
            name="lastName"
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className="w-full space-y-2">
        <Label htmlFor="reg-email">{t.email}</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="w-full space-y-2">
        <Label htmlFor="reg-password">{t.password}</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-muted-foreground text-xs">{t.minPassword}</p>
      </div>
      {state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t.creatingAccount : (t.signUpTitle ?? "Sign up")}
      </Button>
    </form>
  );
}
