"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin-guard";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
} from "@/lib/schemas/admin-user";
import { parseRecordId } from "@/lib/record-id";

function usersListError(msg: string): never {
  redirect(`/admin/users?e=${encodeURIComponent(msg)}`);
}

function userEditError(userId: number, msg: string): never {
  redirect(`/admin/users/${userId}/edit?e=${encodeURIComponent(msg)}`);
}

export async function adminCreateUser(formData: FormData): Promise<void> {
  await requireAdminRole();
  const parsed = adminUserCreateSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? UserRole.USER),
  });
  if (!parsed.success) {
    const first =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ??
      "Check the form fields";
    redirect(`/admin/users/new?e=${encodeURIComponent(first)}`);
  }
  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    await db.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
        role: parsed.data.role,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(
        `/admin/users/new?e=${encodeURIComponent("A user with this email already exists")}`,
      );
    }
    throw e;
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function adminUpdateUser(
  userIdRaw: string | number,
  formData: FormData,
): Promise<void> {
  await requireAdminRole();
  const userId = parseRecordId(userIdRaw);
  if (userId == null) {
    usersListError("Invalid id");
  }
  const parsed = adminUserUpdateSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? UserRole.USER),
  });
  if (!parsed.success) {
    const first =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ??
      "Check the form fields";
    userEditError(userId, first);
  }

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) {
    usersListError("User not found");
  }

  const email = parsed.data.email.toLowerCase();
  const other = await db.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (other) {
    userEditError(userId, "This email is already taken by another user");
  }

  const newPassword = parsed.data.password.trim();
  const data: {
    name: string;
    email: string;
    role: UserRole;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email,
    role: parsed.data.role,
  };
  if (newPassword.length > 0) {
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await db.user.update({
    where: { id: userId },
    data,
  });
  revalidatePath("/admin/users");
  revalidatePath("/me");
  redirect("/admin/users");
}

export async function adminDeleteUser(userIdRaw: string | number): Promise<void> {
  await requireAdminRole();
  const userId = parseRecordId(userIdRaw);
  if (userId == null) {
    usersListError("Invalid id");
  }
  const n = await db.event.count({ where: { userId } });
  if (n > 0) {
    usersListError(
      `Cannot delete user: they have ${n} ${pluralEvents(n)}. Delete those events first.`,
    );
  }
  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

function pluralEvents(n: number): string {
  return n === 1 ? "event" : "events";
}
