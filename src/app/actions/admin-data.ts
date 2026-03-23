"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/slug";

function categoryError(msg: string): never {
  redirect(`/admin/categories?e=${encodeURIComponent(msg)}`);
}

export async function adminDeleteEvent(eventId: string): Promise<void> {
  await requireAdmin();
  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/me");
  redirect("/admin/events");
}

export async function adminCreateCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 80) {
    categoryError("Название до 80 символов");
  }
  let slug = slugify(name);
  const exists = await db.category.findUnique({ where: { slug } });
  if (exists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  try {
    await db.category.create({ data: { name, slug } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      categoryError("Такой идентификатор (slug) уже занят");
    }
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/events/new");
  redirect("/admin/categories");
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await requireAdmin();
  const n = await db.event.count({ where: { categoryId } });
  if (n > 0) {
    categoryError(`Нельзя удалить: к категории привязано ${n} событий`);
  }
  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
