"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { EventFormat, RegistrationMode } from "@prisma/client";
import type { Event } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/actions/events";
import { createEvent, updateEvent } from "@/app/actions/events";
import { toDatetimeLocalValue } from "@/lib/format";
import { confirmMessages } from "@/lib/confirm-messages";
import Link from "next/link";

export type EventCategoryOption = { id: number; name: string };

type Props =
  | { mode: "create"; categories: EventCategoryOption[] }
  | {
      mode: "edit";
      event: Event;
      categories: EventCategoryOption[];
      afterUpdateRedirect?: string;
    };

function fieldError(
  errors: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  const e = errors?.[key];
  return e?.[0];
}

export function EventForm(props: Props) {
  const action = useMemo(
    () =>
      props.mode === "create"
        ? createEvent.bind(null)
        : updateEvent.bind(null, props.event.id),
    [props],
  );

  const initial: ActionState = { ok: false };
  const [state, formAction, pending] = useActionState(action, initial);

  const now = new Date();
  const startSlot = new Date(now);
  const minute = startSlot.getMinutes();
  const roundedMinute = minute <= 30 ? 30 : 60;
  if (roundedMinute === 60) {
    startSlot.setHours(startSlot.getHours() + 1, 0, 0, 0);
  } else {
    startSlot.setMinutes(roundedMinute, 0, 0);
  }
  const endSlot = new Date(startSlot);
  endSlot.setMinutes(endSlot.getMinutes() + 30);

  const defaultStartsAt =
    props.mode === "edit"
      ? toDatetimeLocalValue(props.event.startsAt)
      : toDatetimeLocalValue(startSlot);
  const defaultEndsAt =
    props.mode === "edit"
      ? toDatetimeLocalValue(
          props.event.endsAt ?? props.event.startsAt,
        )
      : toDatetimeLocalValue(endSlot);

  const afterRedirect =
    props.mode === "edit" ? props.afterUpdateRedirect : undefined;
  const values = state.values;
  const [format, setFormat] = useState<EventFormat>(
    props.mode === "edit" ? props.event.format : EventFormat.ONLINE,
  );
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(
    props.mode === "edit"
      ? (
          props.event as Event & {
            registrationMode?: RegistrationMode;
          }
        ).registrationMode ?? RegistrationMode.INTERNAL
      : RegistrationMode.INTERNAL,
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const editEvent = props.mode === "edit" ? (props.event as Event & { locationMapUrl?: string | null; meetingUrl?: string | null }) : null;

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (values?.format === EventFormat.OFFLINE || values?.format === EventFormat.ONLINE) {
      setFormat(values.format);
    }
  }, [values?.format]);
  useEffect(() => {
    if (
      values?.registrationMode === RegistrationMode.INTERNAL ||
      values?.registrationMode === RegistrationMode.EXTERNAL
    ) {
      setRegistrationMode(values.registrationMode);
    }
  }, [values?.registrationMode]);

  if (props.categories.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
        <p className="text-foreground font-medium">No categories</p>
        <p className="mt-2">
          A global administrator must add categories in the{" "}
          <Link href="/admin/references/categories" className="text-primary underline">
            admin panel
          </Link>{" "}
          first.
        </p>
      </div>
    );
  }

  const fieldShell = "space-y-2 min-w-0";

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const ok = window.confirm(
          props.mode === "create"
            ? confirmMessages.eventCreate
            : confirmMessages.eventSave,
        );
        if (!ok) e.preventDefault();
      }}
      className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start"
    >
      {afterRedirect ? (
        <input type="hidden" name="_redirect" value={afterRedirect} />
      ) : null}

      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-3">
        <div className="bg-muted/30 border-border aspect-square overflow-hidden rounded-xl border">
          {coverPreviewUrl || (props.mode === "edit" ? props.event.coverImageUrl : null) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreviewUrl ?? (props.mode === "edit" ? props.event.coverImageUrl ?? "" : "")}
              alt="Cover preview"
              className="size-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
              Cover preview
            </div>
          )}
        </div>
        <div className={fieldShell}>
          <Label htmlFor="coverImage">Cover image (file)</Label>
          <Input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
              setCoverPreviewUrl(URL.createObjectURL(file));
            }}
            aria-invalid={!!fieldError(state.fieldErrors, "coverImage")}
          />
          <p className="text-muted-foreground text-xs">
            JPG/PNG/WEBP, up to 5MB.
          </p>
          {fieldError(state.fieldErrors, "coverImage") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "coverImage")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-border bg-card grid min-w-0 grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-2">
        <div className={cn(fieldShell, "sm:col-span-2")}>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={values?.title ?? (props.mode === "edit" ? props.event.title : "")}
            aria-invalid={!!fieldError(state.fieldErrors, "title")}
          />
          {fieldError(state.fieldErrors, "title") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "title")}
            </p>
          ) : null}
        </div>

        <div className={cn(fieldShell, "sm:col-span-2")}>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={8000}
            defaultValue={
              values?.description ?? (props.mode === "edit" ? props.event.description : "")
            }
            aria-invalid={!!fieldError(state.fieldErrors, "description")}
          />
          {fieldError(state.fieldErrors, "description") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "description")}
            </p>
          ) : null}
        </div>

        <div className={fieldShell}>
          <Label htmlFor="startsAt">Start</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            step={1800}
            defaultValue={values?.startsAt ?? defaultStartsAt}
            aria-invalid={!!fieldError(state.fieldErrors, "startsAt")}
          />
          {fieldError(state.fieldErrors, "startsAt") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "startsAt")}
            </p>
          ) : null}
        </div>

        <div className={fieldShell}>
          <Label htmlFor="endsAt">End</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            required
            step={1800}
            defaultValue={values?.endsAt ?? defaultEndsAt}
            aria-invalid={!!fieldError(state.fieldErrors, "endsAt")}
          />
          {fieldError(state.fieldErrors, "endsAt") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "endsAt")}
            </p>
          ) : null}
        </div>

        <div className={fieldShell}>
          <Label htmlFor="format">Format</Label>
          <select
            id="format"
            name="format"
            required
            value={format}
            onChange={(e) => setFormat(e.target.value as EventFormat)}
            className={cn(
              "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            )}
          >
            <option value={EventFormat.ONLINE}>Online</option>
            <option value={EventFormat.OFFLINE}>Offline</option>
          </select>
        </div>

        <div className={fieldShell}>
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={
              values?.categoryId ??
              (props.mode === "edit"
                ? props.event.categoryId ?? props.categories[0]!.id
                : props.categories[0]!.id)
            }
            className={cn(
              "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            )}
          >
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError(state.fieldErrors, "categoryId") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "categoryId")}
            </p>
          ) : null}
        </div>

        <div className={fieldShell}>
          <Label htmlFor="registrationMode">Registration</Label>
          <select
            id="registrationMode"
            name="registrationMode"
            required
            value={registrationMode}
            onChange={(e) =>
              setRegistrationMode(e.target.value as RegistrationMode)
            }
            className={cn(
              "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            )}
          >
            <option value={RegistrationMode.INTERNAL}>On Luna</option>
            <option value={RegistrationMode.EXTERNAL}>External link</option>
          </select>
        </div>

        {registrationMode === RegistrationMode.EXTERNAL ? (
          <div className={cn(fieldShell, "sm:col-span-2")}>
            <Label htmlFor="externalRegistrationUrl">External registration URL</Label>
            <Input
              id="externalRegistrationUrl"
              name="externalRegistrationUrl"
              type="url"
              inputMode="url"
              placeholder="https://..."
              defaultValue={
                values?.externalRegistrationUrl ??
                (props.mode === "edit"
                  ? (
                      props.event as Event & {
                        externalRegistrationUrl?: string | null;
                      }
                    ).externalRegistrationUrl ?? ""
                  : "")
              }
              aria-invalid={!!fieldError(state.fieldErrors, "externalRegistrationUrl")}
            />
            {fieldError(state.fieldErrors, "externalRegistrationUrl") ? (
              <p className="text-destructive text-sm">
                {fieldError(state.fieldErrors, "externalRegistrationUrl")}
              </p>
            ) : null}
            <div className="mt-1">
              <Label htmlFor="externalSourceLabel">Source label (optional)</Label>
              <Input
                id="externalSourceLabel"
                name="externalSourceLabel"
                maxLength={80}
                placeholder="Timepad, Luma, Eventbrite..."
                defaultValue={
                  values?.externalSourceLabel ??
                  (props.mode === "edit"
                    ? (
                        props.event as Event & {
                          externalSourceLabel?: string | null;
                        }
                      ).externalSourceLabel ?? ""
                    : "")
                }
                aria-invalid={!!fieldError(state.fieldErrors, "externalSourceLabel")}
              />
              {fieldError(state.fieldErrors, "externalSourceLabel") ? (
                <p className="text-destructive text-sm">
                  {fieldError(state.fieldErrors, "externalSourceLabel")}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {format === EventFormat.OFFLINE ? (
          <>
            <div className={fieldShell}>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                maxLength={500}
                placeholder="Address or venue name"
                defaultValue={
                  values?.location ??
                  (props.mode === "edit" ? props.event.location ?? "" : "")
                }
                aria-invalid={!!fieldError(state.fieldErrors, "location")}
              />
              {fieldError(state.fieldErrors, "location") ? (
                <p className="text-destructive text-sm">
                  {fieldError(state.fieldErrors, "location")}
                </p>
              ) : null}
            </div>
            <div className={fieldShell}>
              <Label htmlFor="locationMapUrl">Map link (Google or Yandex)</Label>
              <Input
                id="locationMapUrl"
                name="locationMapUrl"
                type="url"
                inputMode="url"
                placeholder="https://maps.google.com/... or https://yandex.ru/maps/..."
                defaultValue={
                  values?.locationMapUrl ??
                  (props.mode === "edit" ? editEvent?.locationMapUrl ?? "" : "")
                }
                aria-invalid={!!fieldError(state.fieldErrors, "locationMapUrl")}
              />
              {fieldError(state.fieldErrors, "locationMapUrl") ? (
                <p className="text-destructive text-sm">
                  {fieldError(state.fieldErrors, "locationMapUrl")}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className={cn(fieldShell, "sm:col-span-2")}>
            <Label htmlFor="meetingUrl">Meeting link</Label>
            <Input
              id="meetingUrl"
              name="meetingUrl"
              type="url"
              inputMode="url"
              placeholder="https://meet.google.com/... or https://zoom.us/..."
              defaultValue={
                values?.meetingUrl ??
                (props.mode === "edit" ? editEvent?.meetingUrl ?? "" : "")
              }
              aria-invalid={!!fieldError(state.fieldErrors, "meetingUrl")}
            />
            {fieldError(state.fieldErrors, "meetingUrl") ? (
              <p className="text-destructive text-sm">
                {fieldError(state.fieldErrors, "meetingUrl")}
              </p>
            ) : null}
          </div>
        )}

        <div className={fieldShell}>
          <Label htmlFor="capacity">Capacity limit (optional)</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="No limit"
            defaultValue={
              values?.capacity ??
              (props.mode === "edit" && props.event.capacity != null
                ? String(props.event.capacity)
                : "")
            }
            aria-invalid={!!fieldError(state.fieldErrors, "capacity")}
          />
          {fieldError(state.fieldErrors, "capacity") ? (
            <p className="text-destructive text-sm">
              {fieldError(state.fieldErrors, "capacity")}
            </p>
          ) : null}
        </div>

        {state.message ? (
          <p className="text-destructive text-sm sm:col-span-2">{state.message}</p>
        ) : null}

        <div className="sm:col-span-2 flex justify-start">
          <Button
            type="submit"
            disabled={pending}
            className={props.mode === "edit" ? "min-w-32 shrink-0" : "mt-1 w-full min-w-44 sm:w-auto"}
          >
            {pending
              ? "Saving…"
              : props.mode === "create"
                ? "Create event"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
