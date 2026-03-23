"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin-guard";
import { slugify } from "@/lib/slug";
import { parseRecordId } from "@/lib/record-id";

function countryErrList(msg: string): never {
  redirect(`/admin/references/countries?e=${encodeURIComponent(msg)}`);
}

function countryCreateError(msg: string): never {
  redirect(`/admin/references/countries/new?e=${encodeURIComponent(msg)}`);
}

function countryErrDetail(countryId: number, msg: string): never {
  redirect(
    `/admin/references/countries/${countryId}?e=${encodeURIComponent(msg)}`,
  );
}

function cityErrList(msg: string): never {
  redirect(`/admin/references/cities?e=${encodeURIComponent(msg)}`);
}

function cityCreateError(msg: string): never {
  redirect(`/admin/references/cities/new?e=${encodeURIComponent(msg)}`);
}

function cityErrDetail(cityId: number, msg: string): never {
  redirect(`/admin/references/cities/${cityId}?e=${encodeURIComponent(msg)}`);
}

function categoryErrList(msg: string): never {
  redirect(`/admin/references/categories?e=${encodeURIComponent(msg)}`);
}

function categoryCreateError(msg: string): never {
  redirect(`/admin/references/categories/new?e=${encodeURIComponent(msg)}`);
}

function categoryErrDetail(categoryId: number, msg: string): never {
  redirect(
    `/admin/references/categories/${categoryId}?e=${encodeURIComponent(msg)}`,
  );
}

function normalizeCode2(raw: string): string | null {
  const s = raw.trim().toUpperCase();
  if (!s) return null;
  if (s.length !== 2 || !/^[A-Z]{2}$/.test(s)) return "__invalid__";
  return s;
}

export async function adminCreateCountry(formData: FormData): Promise<void> {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const code2Raw = String(formData.get("code2") ?? "").trim();
  if (!name || name.length > 120) {
    countryCreateError("Name must be 120 characters or less");
  }
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "country";
  const code2 = normalizeCode2(code2Raw);
  if (code2 === "__invalid__") {
    countryCreateError("Country code: 2 Latin letters (ISO) or empty");
  }
  const slugTaken = await db.country.findUnique({ where: { slug } });
  if (slugTaken) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  if (code2) {
    const c = await db.country.findUnique({ where: { code2 } });
    if (c) countryCreateError("This ISO code is already taken");
  }
  try {
    await db.country.create({
      data: { name, slug, code2 },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      countryCreateError("Slug or ISO code uniqueness violated");
    }
    throw e;
  }
  revalidatePath("/admin/references/countries");
  revalidatePath("/admin/references/countries/new");
  redirect("/admin/references/countries");
}

export async function adminUpdateCountry(
  countryIdRaw: string | number,
  formData: FormData,
): Promise<void> {
  await requireStaff();
  const countryId = parseRecordId(countryIdRaw);
  if (countryId == null) countryErrList("Invalid id");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const code2Raw = String(formData.get("code2") ?? "").trim();
  if (!name || name.length > 120) {
    countryErrDetail(countryId, "Name must be 120 characters or less");
  }
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "country";
  const code2 = normalizeCode2(code2Raw);
  if (code2 === "__invalid__") {
    countryErrDetail(countryId, "Country code: 2 Latin letters or empty");
  }
  const slugOther = await db.country.findFirst({
    where: { slug, NOT: { id: countryId } },
  });
  if (slugOther) {
    countryErrDetail(countryId, "This slug is used by another country");
  }
  if (code2) {
    const c = await db.country.findFirst({
      where: { code2, NOT: { id: countryId } },
    });
    if (c) countryErrDetail(countryId, "This ISO code is already taken");
  }
  try {
    await db.country.update({
      where: { id: countryId },
      data: { name, slug, code2 },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      countryErrDetail(countryId, "Unique field conflict");
    }
    throw e;
  }
  revalidatePath("/admin/references/countries");
  revalidatePath(`/admin/references/countries/${countryId}`);
  redirect(`/admin/references/countries/${countryId}`);
}

export async function adminDeleteCountry(
  countryIdRaw: string | number,
): Promise<void> {
  await requireStaff();
  const countryId = parseRecordId(countryIdRaw);
  if (countryId == null) countryErrList("Invalid id");
  const n = await db.city.count({ where: { countryId } });
  if (n > 0) {
    countryErrList(`Cannot delete country: it has ${n} city/cities`);
  }
  await db.country.delete({ where: { id: countryId } });
  revalidatePath("/admin/references/countries");
  redirect("/admin/references/countries");
}

export async function adminDeleteCountryFromDetail(
  countryIdRaw: string | number,
): Promise<void> {
  await requireStaff();
  const countryId = parseRecordId(countryIdRaw);
  if (countryId == null) countryErrList("Invalid id");
  const n = await db.city.count({ where: { countryId } });
  if (n > 0) {
    countryErrDetail(
      countryId,
      `Cannot delete country: it has ${n} city/cities`,
    );
  }
  await db.country.delete({ where: { id: countryId } });
  revalidatePath("/admin/references/countries");
  redirect("/admin/references/countries");
}

export async function adminCreateCity(formData: FormData): Promise<void> {
  await requireStaff();
  const countryId = parseRecordId(
    String(formData.get("countryId") ?? "").trim(),
  );
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (countryId == null) cityCreateError("Select a country");
  if (!name || name.length > 120) {
    cityCreateError("City name must be 120 characters or less");
  }
  const country = await db.country.findUnique({ where: { id: countryId } });
  if (!country) cityCreateError("Country not found");
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "city";
  const dup = await db.city.findUnique({
    where: { countryId_slug: { countryId, slug } },
  });
  if (dup) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  try {
    await db.city.create({
      data: { name, slug, countryId },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      cityCreateError("This slug already exists in this country");
    }
    throw e;
  }
  revalidatePath("/admin/references/cities");
  revalidatePath("/admin/references/cities/new");
  revalidatePath("/admin/references/countries");
  redirect("/admin/references/cities");
}

export async function adminUpdateCity(
  cityIdRaw: string | number,
  formData: FormData,
): Promise<void> {
  await requireStaff();
  const cityId = parseRecordId(cityIdRaw);
  if (cityId == null) cityErrList("Invalid id");
  const countryId = parseRecordId(
    String(formData.get("countryId") ?? "").trim(),
  );
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (countryId == null) {
    cityErrDetail(cityId, "Select a country");
  }
  if (!name || name.length > 120) {
    cityErrDetail(cityId, "Name must be 120 characters or less");
  }
  const country = await db.country.findUnique({ where: { id: countryId } });
  if (!country) cityErrDetail(cityId, "Country not found");
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "city";
  const dup = await db.city.findFirst({
    where: {
      countryId,
      slug,
      NOT: { id: cityId },
    },
  });
  if (dup) {
    cityErrDetail(cityId, "This slug already exists in the selected country");
  }
  try {
    await db.city.update({
      where: { id: cityId },
      data: { name, slug, countryId },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      cityErrDetail(cityId, "Slug conflict in this country");
    }
    throw e;
  }
  revalidatePath("/admin/references/cities");
  revalidatePath("/admin/references/countries");
  revalidatePath(`/admin/references/cities/${cityId}`);
  redirect(`/admin/references/cities/${cityId}`);
}

export async function adminDeleteCity(cityIdRaw: string | number): Promise<void> {
  await requireStaff();
  const cityId = parseRecordId(cityIdRaw);
  if (cityId == null) cityErrList("Invalid id");
  await db.city.delete({ where: { id: cityId } });
  revalidatePath("/admin/references/cities");
  revalidatePath("/admin/references/countries");
  redirect("/admin/references/cities");
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
  if (categoryId == null) categoryErrList("Invalid id");
  const n = await db.event.count({ where: { categoryId } });
  if (n > 0) {
    categoryErrList(`Cannot delete: ${n} event(s) use this category`);
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
  if (categoryId == null) categoryErrList("Invalid id");
  const n = await db.event.count({ where: { categoryId } });
  if (n > 0) {
    categoryErrDetail(
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
  if (categoryId == null) categoryErrList("Invalid id");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (!name || name.length > 80) {
    categoryErrDetail(categoryId, "Name must be 80 characters or less");
  }
  let slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) slug = "category";
  const taken = await db.category.findFirst({
    where: { slug, NOT: { id: categoryId } },
  });
  if (taken) {
    categoryErrDetail(categoryId, "This slug is already taken");
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
