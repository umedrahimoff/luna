import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Discover",
  description: "Discover events on Luna",
  path: "/",
  noIndex: true,
});

export default function DiscoverPage() {
  redirect("/");
}
