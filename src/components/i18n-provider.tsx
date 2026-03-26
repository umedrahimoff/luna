"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/types";

type I18nContextValue = {
  dictionary: Dictionary;
  englishDictionary: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type Props = {
  dictionary: Dictionary;
  englishDictionary: Dictionary;
  children: React.ReactNode;
};

export function I18nProvider({ dictionary, englishDictionary, children }: Props) {
  const value = useMemo(
    () => ({ dictionary, englishDictionary }),
    [dictionary, englishDictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  const pathname = usePathname();
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  const isAdminRoute = pathname.startsWith("/admin");
  return isAdminRoute ? ctx.englishDictionary : ctx.dictionary;
}
