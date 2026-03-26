import { AppLanguage } from "@prisma/client";

type NamedRecord = {
  name: string;
  nameEn?: string | null;
  nameRu?: string | null;
};

export function localizedName(
  entity: NamedRecord,
  language: AppLanguage,
): string {
  if (language === AppLanguage.RU) {
    return entity.nameRu?.trim() || entity.nameEn?.trim() || entity.name;
  }
  return entity.nameEn?.trim() || entity.nameRu?.trim() || entity.name;
}
