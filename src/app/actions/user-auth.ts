"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  clearUserSessionCookie,
  createUserSessionToken,
  setUserSessionCookie,
  userSessionConfigured,
} from "@/lib/user-token";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";

export type AuthState = { ok: boolean; message?: string };

export async function registerUser(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message:
        "Registration disabled: set LUNA_SESSION_SECRET (≥16 characters) in .env",
    };
  }
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0],
    };
  }
  const email = parsed.data.email.toLowerCase();
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false, message: "A user with this email already exists" };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
    },
  });
  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Could not create session" };
  }
  await setUserSessionCookie(token);
  redirect("/me");
}

export async function loginUser(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message:
        "Sign-in disabled: set LUNA_SESSION_SECRET (≥16 characters) in .env",
    };
  }
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0],
    };
  }
  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, message: "Invalid email or password" };
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { ok: false, message: "Invalid email or password" };
  }
  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Could not create session" };
  }
  await setUserSessionCookie(token);
  const next = String(formData.get("next") ?? "").trim();
  if (next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect("/me");
}

export async function logoutUser(): Promise<void> {
  await clearUserSessionCookie();
  redirect("/");
}
