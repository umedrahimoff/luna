import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

/** Dev admin: sign in on /login with this email and password, then open /admin */
const LUNA_DEV_ADMIN_EMAIL = "luna@luna.uz";
const LUNA_DEV_ADMIN_PASSWORD = "luna@luna.uz";

const DEFAULT_CATEGORIES = [
  { name: "Conferences", slug: "conferences" },
  { name: "Networking", slug: "networking" },
  { name: "Education", slug: "education" },
  { name: "Leisure", slug: "leisure" },
  { name: "Other", slug: "other" },
];

/** Central Asia countries + ISO 3166-1 alpha-2 */
const CENTRAL_ASIA_COUNTRIES = [
  { name: "Kazakhstan", slug: "kazakhstan", code2: "KZ" },
  { name: "Kyrgyzstan", slug: "kyrgyzstan", code2: "KG" },
  { name: "Tajikistan", slug: "tajikistan", code2: "TJ" },
  { name: "Turkmenistan", slug: "turkmenistan", code2: "TM" },
  { name: "Uzbekistan", slug: "uzbekistan", code2: "UZ" },
] as const;

/** Major cities; slug is built with slugify(name) on upsert */
const CENTRAL_ASIA_CITIES: { countrySlug: string; name: string }[] = [
  { countrySlug: "kazakhstan", name: "Almaty" },
  { countrySlug: "kazakhstan", name: "Astana" },
  { countrySlug: "kazakhstan", name: "Shymkent" },
  { countrySlug: "kazakhstan", name: "Karaganda" },
  { countrySlug: "kyrgyzstan", name: "Bishkek" },
  { countrySlug: "kyrgyzstan", name: "Osh" },
  { countrySlug: "tajikistan", name: "Dushanbe" },
  { countrySlug: "tajikistan", name: "Khujand" },
  { countrySlug: "turkmenistan", name: "Ashgabat" },
  { countrySlug: "turkmenistan", name: "Turkmenabat" },
  { countrySlug: "uzbekistan", name: "Tashkent" },
  { countrySlug: "uzbekistan", name: "Samarkand" },
  { countrySlug: "uzbekistan", name: "Namangan" },
  { countrySlug: "uzbekistan", name: "Andijan" },
  { countrySlug: "uzbekistan", name: "Nukus" },
  { countrySlug: "uzbekistan", name: "Bukhara" },
];

async function main() {
  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name },
    });
  }
  console.log("Categories updated:", DEFAULT_CATEGORIES.length);

  for (const row of CENTRAL_ASIA_COUNTRIES) {
    await prisma.country.upsert({
      where: { slug: row.slug },
      create: {
        name: row.name,
        slug: row.slug,
        code2: row.code2,
      },
      update: { name: row.name, code2: row.code2 },
    });
  }
  console.log("Central Asia countries:", CENTRAL_ASIA_COUNTRIES.length);

  for (const { countrySlug, name } of CENTRAL_ASIA_CITIES) {
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug },
    });
    if (!country) {
      console.warn("Skipping city (country missing):", countrySlug, name);
      continue;
    }
    const slug = slugify(name);
    await prisma.city.upsert({
      where: {
        countryId_slug: { countryId: country.id, slug },
      },
      create: { name, slug, countryId: country.id },
      update: { name },
    });
  }
  console.log("Central Asia cities:", CENTRAL_ASIA_CITIES.length);

  const devAdminHash = await bcrypt.hash(LUNA_DEV_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: LUNA_DEV_ADMIN_EMAIL },
    create: {
      email: LUNA_DEV_ADMIN_EMAIL,
      name: "Luna Admin",
      passwordHash: devAdminHash,
      role: UserRole.ADMIN,
    },
    update: {
      name: "Luna Admin",
      passwordHash: devAdminHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(
    "Dev admin user:",
    LUNA_DEV_ADMIN_EMAIL,
    "(password same as email — change in production)",
  );

  const adminEmail = process.env.LUNA_INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    const r = await prisma.user.updateMany({
      where: { email: adminEmail },
      data: { role: UserRole.ADMIN },
    });
    if (r.count > 0) {
      console.log("ADMIN role assigned:", adminEmail);
    } else {
      console.warn(
        "LUNA_INITIAL_ADMIN_EMAIL is set but user was not found:",
        adminEmail,
      );
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
