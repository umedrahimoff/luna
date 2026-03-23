"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TabId = "overview" | "attendees";

function tabFromHash(): TabId {
  if (typeof window === "undefined") return "overview";
  return window.location.hash === "#attendees" ? "attendees" : "overview";
}

/**
 * Hash-based tabs for admin event detail; keeps #overview / #attendees URLs for redirects and deep links.
 */
export function AdminEventDetailTabNav({
  overviewHref,
  attendeesHref,
}: {
  overviewHref: string;
  attendeesHref: string;
}) {
  const [active, setActive] = useState<TabId>("overview");

  useEffect(() => {
    setActive(tabFromHash());
    const onHashChange = () => setActive(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center px-5 py-3 text-sm font-medium transition-colors",
      "-mb-px border-b-[3px]",
      isActive
        ? "bg-blue-50 text-blue-600 border-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700",
    );

  return (
    <nav
      className="border-border flex flex-wrap border-b bg-white"
      aria-label="Event sections"
    >
      <a href={overviewHref} className={linkClass(active === "overview")}>
        General Information
      </a>
      <a href={attendeesHref} className={linkClass(active === "attendees")}>
        Attendees
      </a>
    </nav>
  );
}
