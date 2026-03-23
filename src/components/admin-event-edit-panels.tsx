"use client";

import { useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "attendees";

function readTab(): Tab {
  return window.location.hash === "#attendees" ? "attendees" : "overview";
}

/**
 * Tab bar + one visible panel by hash (#overview | #attendees).
 * Panels stay mounted (hidden) so the edit form keeps state when switching.
 */
export function AdminEventEditPanels({
  overviewHref,
  attendeesHref,
  overview,
  attendees,
}: {
  overviewHref: string;
  attendeesHref: string;
  overview: React.ReactNode;
  attendees: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  useLayoutEffect(() => {
    const sync = () => setTab(readTab());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex items-center px-5 py-3 text-sm font-medium transition-colors",
      "-mb-px border-b-[3px]",
      active
        ? "bg-blue-50 text-blue-600 border-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700",
    );

  return (
    <div className="border-border bg-card scroll-mt-20 overflow-hidden rounded-xl border ring-1 ring-black/5">
      <nav
        className="border-border flex flex-wrap border-b bg-white"
        aria-label="Event sections"
      >
        <a href={overviewHref} className={linkClass(tab === "overview")}>
          General Information
        </a>
        <a href={attendeesHref} className={linkClass(tab === "attendees")}>
          Attendees
        </a>
      </nav>
      <section
        id="overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={tab !== "overview"}
        className="space-y-3 p-4"
      >
        {overview}
      </section>
      <section
        id="attendees"
        role="tabpanel"
        aria-labelledby="tab-attendees"
        hidden={tab !== "attendees"}
        className="space-y-3 p-4"
      >
        {attendees}
      </section>
    </div>
  );
}
