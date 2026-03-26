import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationMode, type Event } from "@prisma/client";
import { AdminEventEditPanels } from "@/components/admin-event-edit-panels";
import { AdminEventRegistrationQuestionsSection } from "@/components/admin-event-registration-questions-section";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { getUserLanguage } from "@/lib/i18n/server";
import { localizedName } from "@/lib/localized-name";
import { isStaffAccess } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import { cn } from "@/lib/utils";
import { isValidEventPublicCode } from "@/lib/event-public-code";

type Props = { params: Promise<{ code: string }> };

export default async function EditEventPage({ params }: Props) {
  const { code } = await params;
  if (!isValidEventPublicCode(code)) notFound();

  const user = await getSessionUser();
  const staff = await isStaffAccess();
  const event = await db.event.findUnique({
    where: { publicCode: code },
    include: {
      city: {
        select: { name: true, nameEn: true, nameRu: true },
      },
      registrations: {
        orderBy: { createdAt: "desc" },
      },
      registrationQuestions: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          optionsJson: true,
          required: true,
        },
      },
    },
  });
  if (!event || (!staff && (!user || event.userId !== user.id))) notFound();

  const language = await getUserLanguage();
  const categoriesRaw = await db.category.findMany({
    orderBy: { nameEn: "asc" },
    select: { id: true, name: true, nameEn: true, nameRu: true },
  });
  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: localizedName(c, language),
  }));

  const editBase = `/${event.publicCode}/edit`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Edit event
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
        </div>
        <Link
          href={`/${event.publicCode}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
        >
          ← Back to event
        </Link>
      </div>
      <AdminEventEditPanels
        overviewHref={`${editBase}#overview`}
        attendeesHref={`${editBase}#attendees`}
        questionsHref={`${editBase}#questions`}
        overview={
          <>
            <h3 id="tab-overview" className="sr-only">
              Event overview
            </h3>
            <EventForm mode="edit" event={event as Event} categories={categories} />
          </>
        }
        attendees={
          <>
            <h3 id="tab-attendees" className="sr-only">
              Participants
            </h3>
            <div className="flex flex-col gap-3">
              {(event as Event & { registrationMode?: RegistrationMode }).registrationMode ===
              RegistrationMode.EXTERNAL ? (
                <p className="text-muted-foreground text-sm">
                  Registrations are handled externally for this event.
                </p>
              ) : null}
              {(event as Event & { registrationMode?: RegistrationMode }).registrationMode !==
              RegistrationMode.EXTERNAL ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    People who registered for this event ({event.registrations.length} total).
                  </p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="p-2.5 font-medium">Name</th>
                          <th className="p-2.5 font-medium">Email</th>
                          <th className="p-2.5 font-medium">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.registrations.map((r) => (
                          <tr key={r.id} className="border-b last:border-0">
                            <td className="p-2.5">{r.name}</td>
                            <td className="text-muted-foreground p-2.5">{r.email}</td>
                            <td className="text-muted-foreground p-2.5 tabular-nums">
                              {r.createdAt.toLocaleString("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                                hour12: false,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {event.registrations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No participants yet.</p>
                  ) : null}
                </>
              ) : null}
            </div>
          </>
        }
        questions={
          <>
            <h3 id="tab-questions" className="sr-only">
              Registration questions
            </h3>
            <AdminEventRegistrationQuestionsSection
              eventId={event.id}
              questions={event.registrationQuestions}
            />
          </>
        }
      />
    </div>
  );
}
