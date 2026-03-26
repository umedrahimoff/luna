import type { Metadata } from "next";
import { LegalArticle } from "@/lib/legal/legal-article";
import { getTermsDocument } from "@/lib/legal/terms-data";
import { buildPageMetadata } from "@/lib/seo";
import { getUserLanguage } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const doc = getTermsDocument(await getUserLanguage());
  return buildPageMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const doc = getTermsDocument(await getUserLanguage());
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
