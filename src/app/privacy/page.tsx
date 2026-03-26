import type { Metadata } from "next";
import { LegalArticle } from "@/lib/legal/legal-article";
import { getPrivacyDocument } from "@/lib/legal/privacy-data";
import { buildPageMetadata } from "@/lib/seo";
import { getUserLanguage } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const doc = getPrivacyDocument(await getUserLanguage());
  return buildPageMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const doc = getPrivacyDocument(await getUserLanguage());
  return (
    <LegalArticle
      heading={doc.heading}
      effectiveLabel={doc.effectiveLabel}
      effectiveDate={doc.effectiveDate}
      intro={doc.intro}
      blocks={doc.blocks}
    />
  );
}
