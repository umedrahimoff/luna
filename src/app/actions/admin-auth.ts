"use server";

import { redirect } from "next/navigation";
import {
  adminAuthConfigured,
  clearAdminSessionCookie,
  createAdminSessionToken,
  isAdminSession,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export type AdminLoginState = { ok: boolean; message?: string };

export async function adminLogin(
  _prev: AdminLoginState | undefined,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!adminAuthConfigured()) {
    return {
      ok: false,
      message:
        "Вход отключён: задайте LUNA_ADMIN_SECRET (≥16 символов) и LUNA_ADMIN_PASSWORD в .env",
    };
  }
  const password = String(formData.get("password") ?? "");
  if (password !== process.env.LUNA_ADMIN_PASSWORD) {
    return { ok: false, message: "Неверный пароль" };
  }
  const token = createAdminSessionToken();
  if (!token) {
    return { ok: false, message: "Не удалось выдать сессию" };
  }
  await setAdminSessionCookie(token);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function checkAdminLoggedIn(): Promise<boolean> {
  return isAdminSession();
}
