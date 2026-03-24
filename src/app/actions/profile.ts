"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from "@/lib/schemas/profile";
import { joinDisplayName } from "@/lib/display-name";
import { parsePublicUsername } from "@/lib/username";
import { clearUserSessionCookie } from "@/lib/user-token";
import { requireUser } from "@/lib/require-user";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROTECTED_ACCOUNT_EMAIL = "thisisumed@gmail.com";
const PROTECTED_ACCOUNT_EMAIL_NORM = PROTECTED_ACCOUNT_EMAIL
  .trim()
  .toLowerCase();

async function removeAvatarFile(avatarUrl: string | null | undefined) {
  if (!avatarUrl?.startsWith("/uploads/avatars/")) return;
  const filePath = path.join(process.cwd(), "public", avatarUrl);
  try {
    await unlink(filePath);
  } catch {
    /* ignore missing file */
  }
}

export type ProfileActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateProfile(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const sessionUser = await requireUser();
  const userId = sessionUser.id;

  const parsed = updateProfileSchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { ok: false, fieldErrors: fe, message: undefined };
  }

  const name = joinDisplayName(parsed.data.firstName, parsed.data.lastName);
  if (name.length > 120) {
    return {
      ok: false,
      fieldErrors: {
        firstName: ["Full name is too long (max 120 characters)."],
      },
    };
  }

  const email = parsed.data.email?.toLowerCase() ?? null;
  if (email) {
    const existing = await db.user.findFirst({
      where: { email, NOT: { id: userId } },
      select: { id: true },
    });
    if (existing) {
      return {
        ok: false,
        fieldErrors: { email: ["This email is already in use"] },
      };
    }
  }

  const uResult = parsePublicUsername(
    String(formData.get("username") ?? ""),
  );
  if (!uResult.ok) {
    return {
      ok: false,
      fieldErrors: { username: [uResult.message] },
    };
  }
  if (uResult.value) {
    const taken = await db.user.findFirst({
      where: { username: uResult.value, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) {
      return {
        ok: false,
        fieldErrors: { username: ["This username is already taken"] },
      };
    }
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      bio: parsed.data.bio ?? null,
      username: uResult.value,
    },
  });

  return { ok: true, message: "Profile saved." };
}

export async function uploadProfileAvatar(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image file." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, message: "Image must be 2 MB or smaller." };
  }
  if (!AVATAR_TYPES.has(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, or WebP." };
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const prev = await db.user.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });
  await removeAvatarFile(prev?.avatarUrl);

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  const filename = `${session.id}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);
  const avatarUrl = `/uploads/avatars/${filename}`;

  await db.user.update({
    where: { id: session.id },
    data: { avatarUrl },
  });

  return { ok: true, message: "Photo updated." };
}

export async function clearProfileAvatar(
  _prev: ProfileActionState | undefined,
  _formData?: FormData,
): Promise<ProfileActionState> {
  const session = await requireUser();
  const row = await db.user.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });
  await removeAvatarFile(row?.avatarUrl);
  await db.user.update({
    where: { id: session.id },
    data: { avatarUrl: null },
  });
  return { ok: true, message: "Photo removed." };
}

export async function changePassword(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireUser();
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return { ok: false, message: "Session invalid" };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ok = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!ok) {
    return {
      ok: false,
      fieldErrors: { currentPassword: ["Password is incorrect"] },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { ok: true, message: "Password updated." };
}

export async function deleteAccount(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireUser();
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, passwordHash: true, email: true, role: true },
  });
  if (!user) {
    return { ok: false, message: "Session invalid" };
  }
  const protectedByEmail =
    (user.email ?? "").trim().toLowerCase() === PROTECTED_ACCOUNT_EMAIL_NORM;
  const protectedAccount = await db.user.findFirst({
    where: { email: PROTECTED_ACCOUNT_EMAIL_NORM },
    select: { id: true },
  });
  const protectedById =
    protectedAccount != null && protectedAccount.id === user.id;
  if (protectedByEmail || protectedById) {
    return { ok: false, message: "This account is protected and cannot be deleted." };
  }
  if (user.role === UserRole.ADMIN) {
    const adminCount = await db.user.count({ where: { role: UserRole.ADMIN } });
    if (adminCount <= 1) {
      return { ok: false, message: "You cannot delete the last administrator account." };
    }
  }

  const parsed = deleteAccountSchema.safeParse({
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      fieldErrors: { password: ["Password is incorrect"] },
    };
  }

  const avatarRow = await db.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });
  await removeAvatarFile(avatarRow?.avatarUrl);

  await db.$transaction(async (tx) => {
    await tx.event.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  await clearUserSessionCookie();
  redirect("/");
}
