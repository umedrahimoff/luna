"use client";

import { useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "attendees" | "questions";

function readTab(): Tab {
  if (window.location.hash === "#attendees") return "attendees";
  if (window.location.hash === "#questions") return "questions";
  return "overview";
}

/**
 * Tab bar + one visible panel by hash (#overview | #attendees).
 * Panels stay mounted (hidden) so the edit form keeps state when switching.
 */
export function AdminEventEditPanels({
  overviewHref,
  attendeesHref,
  questionsHref,
  overview,
  attendees,
  questions,
}: {
  overviewHref: string;
  attendeesHref: string;
  questionsHref: string;
  overview: React.ReactNode;
  attendees: React.ReactNode;
  questions: React.ReactNode;
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
          Event overview
        </a>
        <a href={attendeesHref} className={linkClass(tab === "attendees")}>
          Participants
        </a>
        <a href={questionsHref} className={linkClass(tab === "questions")}>
          Registration questions
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
        id="questions"
        role="tabpanel"
        aria-labelledby="tab-questions"
        hidden={tab !== "questions"}
        className="space-y-3 p-4"
      >
        {questions}
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
