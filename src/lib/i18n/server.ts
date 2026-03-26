import { AppLanguage } from "@prisma/client";
import { cache } from "react";
import { getSessionUser } from "@/lib/user-session";

export const getUserLanguage = cache(async (): Promise<AppLanguage> => {
  const user = await getSessionUser();
  return user?.preferredLanguage ?? AppLanguage.EN;
});
