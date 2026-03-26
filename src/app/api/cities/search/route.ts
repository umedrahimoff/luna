import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserLanguage } from "@/lib/i18n/server";
import { localizedName } from "@/lib/localized-name";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json({ items: [] });
  }
  const language = await getUserLanguage();
  const cities = await db.city.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { nameEn: { contains: q } },
        { nameRu: { contains: q } },
        { country: { name: { contains: q } } },
        { country: { nameEn: { contains: q } } },
        { country: { nameRu: { contains: q } } },
      ],
    },
    include: {
      country: {
        select: { name: true, nameEn: true, nameRu: true },
      },
    },
    orderBy: [{ nameEn: "asc" }, { name: "asc" }],
    take: 12,
  });

  return NextResponse.json({
    items: cities.map((city) => ({
      id: city.id,
      name: localizedName(city, language),
      countryName: localizedName(city.country, language),
    })),
  });
}
