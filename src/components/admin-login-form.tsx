"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AdminLoginState = { ok: false };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, initial);

  return (
    <form action={formAction} className="mx-auto flex max-w-sm flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="password">Пароль администратора</Label>
        <Input
          id="password"
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
        {pending ? "Вход…" : "Войти"}
      </Button>
    </form>
  );
}
