"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { registerForEvent } from "@/app/actions/registrations";
import type { ActionState } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: ActionState = { ok: false };

type Props = {
  eventId: string | number;
  closed: boolean;
  isRegistered?: boolean;
  eventTitle?: string;
  startsAtIso?: string;
  endsAtIso?: string;
  eventLocation?: string | null;
  eventUrl?: string;
  questions?: Array<{
    id: number;
    type: string;
    label: string;
    placeholder: string | null;
    optionsJson: unknown;
    required: boolean;
  }>;
};

function formatStartsIn(startsAtIso?: string): string | null {
  if (!startsAtIso) return null;
  const start = new Date(startsAtIso);
  const diff = start.getTime() - Date.now();
  if (Number.isNaN(start.getTime()) || diff <= 0) return "Started";
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days <= 0) return `Starting in ${hours}h`;
  return `Starting in ${days}d ${hours}h`;
}

function toGoogleCalendarUrl(params: {
  title?: string;
  startsAtIso?: string;
  endsAtIso?: string;
  details?: string;
  location?: string | null;
}) {
  if (!params.startsAtIso || !params.endsAtIso) return null;
  const start = new Date(params.startsAtIso);
  const end = new Date(params.endsAtIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(".000Z", "Z");
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", params.title ?? "Luna event");
  u.searchParams.set("dates", `${fmt(start)}/${fmt(end)}`);
  if (params.details) u.searchParams.set("details", params.details);
  if (params.location) u.searchParams.set("location", params.location);
  return u.toString();
}

export function EventRegisterForm({
  eventId,
  closed,
  isRegistered = false,
  eventTitle,
  startsAtIso,
  endsAtIso,
  eventLocation,
  eventUrl,
  questions = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const action = useMemo(
    () => registerForEvent.bind(null, eventId),
    [eventId],
  );
  const [state, formAction, pending] = useActionState(action, initial);
  const startsIn = formatStartsIn(startsAtIso);
  const calUrl = toGoogleCalendarUrl({
    title: eventTitle,
    startsAtIso,
    endsAtIso,
    details: eventUrl,
    location: eventLocation,
  });
  const registeredNow = isRegistered || state.ok;

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [state.ok]);

  if (closed) {
    return (
      <div className="border-border bg-card rounded-2xl border p-4 sm:p-5">
        <p className="text-muted-foreground text-sm">
          Registration closed: capacity reached.
        </p>
      </div>
    );
  }

  if (registeredNow) {
    return (
      <div className="border-border bg-card rounded-2xl border p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">You&apos;re in</h3>
          {startsIn ? (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
              {startsIn}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {calUrl ? (
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "border-input bg-background hover:bg-accent inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              )}
            >
              Add to Calendar
            </a>
          ) : null}
          {eventUrl ? (
            <a
              href={`mailto:?subject=${encodeURIComponent(eventTitle ?? "Luna event")}&body=${encodeURIComponent(eventUrl)}`}
              className={cn(
                "border-input bg-background hover:bg-accent inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              )}
            >
              Invite a Friend
            </a>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          You are already registered for this event.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-border bg-card rounded-2xl border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">
              Event Registration
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Open the form and submit your details to request joining this event.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto"
          >
            Request to Join
          </Button>
        </div>

        {state.ok && state.message ? (
          <p className="text-primary mt-3 text-sm font-medium">{state.message}</p>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="bg-background/70 absolute inset-0 cursor-default backdrop-blur-sm"
            aria-hidden
            onClick={() => !pending && setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "border-border bg-card text-card-foreground relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl border p-5 shadow-xl ring-1 ring-black/5",
            )}
          >
            <div>
              <h4 className="text-base font-semibold tracking-tight">
                Registration
              </h4>
              <p className="text-muted-foreground mt-1 text-sm">
                Fill in required fields and send your request.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label htmlFor={`ev-reg-name-${eventId}`}>Name</Label>
                <Input
                  id={`ev-reg-name-${eventId}`}
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                />
                {state.fieldErrors?.name?.[0] ? (
                  <p className="text-destructive text-xs">{state.fieldErrors.name[0]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ev-reg-email-${eventId}`}>Email</Label>
                <Input
                  id={`ev-reg-email-${eventId}`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                {state.fieldErrors?.email?.[0] ? (
                  <p className="text-destructive text-xs">
                    {state.fieldErrors.email[0]}
                  </p>
                ) : null}
              </div>

              {questions.map((q) => (
                <div className="space-y-2" key={q.id}>
                  <Label htmlFor={`ev-reg-q-${eventId}-${q.id}`}>
                    {q.label}
                    {q.required ? " *" : ""}
                  </Label>
                  {q.type === "options" ? (
                    <select
                      id={`ev-reg-q-${eventId}-${q.id}`}
                      name={`q_${q.id}`}
                      required={q.required}
                      className="border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
                    >
                      <option value="">Select an option</option>
                      {Array.isArray(q.optionsJson)
                        ? q.optionsJson.map((opt, idx) => (
                            <option key={`${q.id}-${idx}`} value={String(opt)}>
                              {String(opt)}
                            </option>
                          ))
                        : null}
                    </select>
                  ) : q.type === "checkbox" || q.type === "terms" ? (
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        id={`ev-reg-q-${eventId}-${q.id}`}
                        name={`q_${q.id}`}
                        type="checkbox"
                        required={q.required}
                        className="size-4"
                      />
                      I agree
                    </label>
                  ) : (
                    <Input
                      id={`ev-reg-q-${eventId}-${q.id}`}
                      name={`q_${q.id}`}
                      required={q.required}
                      maxLength={500}
                      type={
                        q.type === "mobile"
                          ? "tel"
                          : q.type === "website" || q.type === "social"
                            ? "url"
                            : "text"
                      }
                      inputMode={
                        q.type === "mobile"
                          ? "tel"
                          : q.type === "website" || q.type === "social"
                            ? "url"
                            : "text"
                      }
                      placeholder={q.placeholder ?? undefined}
                    />
                  )}
                  {state.fieldErrors?.[`q_${q.id}`]?.[0] ? (
                    <p className="text-destructive text-xs">
                      {state.fieldErrors[`q_${q.id}`]?.[0]}
                    </p>
                  ) : null}
                </div>
              ))}

              {state.message && !state.ok ? (
                <p className="text-destructive text-sm">{state.message}</p>
              ) : null}

              <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                  {pending ? "Submitting..." : "Request to Join"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
