import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Конференции", slug: "conferences" },
  { name: "Нетворкинг", slug: "networking" },
  { name: "Образование", slug: "education" },
  { name: "Досуг", slug: "leisure" },
  { name: "Прочее", slug: "other" },
];

async function main() {
  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name },
    });
  }
  console.log("Категории обновлены:", DEFAULT_CATEGORIES.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
