"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin-guard";
import { slugify } from "@/lib/slug";
import { parseRecordId } from "@/lib/record-id";

function categoryError(msg: string): never {
  redirect(`/admin/references/categories?e=${encodeURIComponent(msg)}`);
}

function categoryCreateError(msg: string): never {
  redirect(`/admin/references/categories/new?e=${encodeURIComponent(msg)}`);
}

function categoryDetailError(categoryId: number, msg: string): never {
  redirect(
    `/admin/references/categories/${categoryId}?e=${encodeURIComponent(msg)}`,
  );
}

export async function adminDeleteEvent(eventIdRaw: string | number): Promise<void> {
  await requireStaff();
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) redirect("/admin/events");
  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/me");
  redirect("/admin/events");
}

export async function adminCreateCategory(formData: FormData): Promise<void> {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 80) {
    categoryCreateError("Name must be 80 characters or less");
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
      categoryCreateError("This slug is already taken");
    }
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/admin/references/categories");
  revalidatePath("/admin/references/categories/new");
  revalidatePath("/events/new");
  redirect("/admin/references/categories");
}

export async function adminDeleteCategory(
  categoryIdRaw: string | number,
): Promise<void> {
  await requireStaff();
  const categoryId = parseRecordId(categoryIdRaw);
  if (categoryId == null) categoryError("Invalid id");
  const n = await db.event.count({ where: { categoryId } });
  if (n > 0) {
    categoryError(`Cannot delete: ${n} event(s) use this category`);
  }
  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/");
  revalidatePath("/admin/references/categories");
  redirect("/admin/references/categories");
}

export async function adminDeleteCategoryFromDetail(
  categoryIdRaw: string | number,
): Promise<void> {
  await requireStaff();
  const categoryId = parseRecordId(categoryIdRaw);
  if (categoryId == null) categoryError("Invalid id");
  const n = await db.event.count({ where: { categoryId } });
  if (n > 0) {
    categoryDetailError(
      categoryId,
      `Cannot delete: ${n} event(s) use this category`,
    );
  }
  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/");
  revalidatePath("/admin/references/categories");
  redirect("/admin/references/categories");
}

export async function adminUpdateCategory(
  categoryIdRaw: string | number,
  formData: FormData,
): Promise<void> {
  await requireStaff();
  const categoryId = parseRecordId(categoryIdRaw);
  if (categoryId == null) categoryError("Invalid id");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (!name || name.length > 80) {
    categoryDetailError(categoryId, "Name must be 80 characters or less");
  }
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "category";
  const taken = await db.category.findFirst({
    where: { slug, NOT: { id: categoryId } },
  });
  if (taken) {
    categoryDetailError(categoryId, "This slug is already taken");
  }
  await db.category.update({
    where: { id: categoryId },
    data: { name, slug },
  });
  revalidatePath("/");
  revalidatePath("/admin/references/categories");
  revalidatePath(`/admin/references/categories/${categoryId}`);
  redirect(`/admin/references/categories/${categoryId}`);
}
