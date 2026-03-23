"use client";

import { useActionState, useMemo } from "react";
import { EventFormat } from "@prisma/client";
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

  const defaultStartsAt =
    props.mode === "edit"
      ? toDatetimeLocalValue(props.event.startsAt)
      : "";
  const defaultEndsAt =
    props.mode === "edit"
      ? toDatetimeLocalValue(
          props.event.endsAt ?? props.event.startsAt,
        )
      : "";

  const afterRedirect =
    props.mode === "edit" ? props.afterUpdateRedirect : undefined;

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
  const span2 = "sm:col-span-2";

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
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {afterRedirect ? (
        <input type="hidden" name="_redirect" value={afterRedirect} />
      ) : null}

      <div className={cn(fieldShell)}>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={
            props.mode === "edit"
              ? props.event.categoryId ?? props.categories[0]!.id
              : props.categories[0]!.id
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
        {fieldError(state.fieldErrors, "categoryId") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "categoryId")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell)}>
        <Label htmlFor="format">Format</Label>
        <select
          id="format"
          name="format"
          required
          defaultValue={
            props.mode === "edit"
              ? props.event.format
              : EventFormat.ONLINE
          }
          className={cn(
            "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
          )}
        >
          <option value={EventFormat.ONLINE}>Online</option>
          <option value={EventFormat.OFFLINE}>Offline</option>
        </select>
        {fieldError(state.fieldErrors, "format") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "format")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell, span2)}>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={props.mode === "edit" ? props.event.title : ""}
          aria-invalid={!!fieldError(state.fieldErrors, "title")}
        />
        {fieldError(state.fieldErrors, "title") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "title")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell, span2)}>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={8000}
          defaultValue={
            props.mode === "edit" ? props.event.description : ""
          }
          aria-invalid={!!fieldError(state.fieldErrors, "description")}
        />
        {fieldError(state.fieldErrors, "description") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "description")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell, span2)}>
        <Label htmlFor="coverImageUrl">Cover image (URL)</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          inputMode="url"
          placeholder="https://example.com/poster.jpg"
          defaultValue={
            props.mode === "edit" ? props.event.coverImageUrl ?? "" : ""
          }
          aria-invalid={!!fieldError(state.fieldErrors, "coverImageUrl")}
        />
        <p className="text-muted-foreground text-xs leading-relaxed">
          A square <strong className="font-medium text-foreground">1:1</strong>{" "}
          image works best. Leave empty for a placeholder.
        </p>
        {fieldError(state.fieldErrors, "coverImageUrl") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "coverImageUrl")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell)}>
        <Label htmlFor="startsAt">Start</Label>
        <Input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={defaultStartsAt}
          aria-invalid={!!fieldError(state.fieldErrors, "startsAt")}
        />
        {fieldError(state.fieldErrors, "startsAt") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "startsAt")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell)}>
        <Label htmlFor="endsAt">End</Label>
        <Input
          id="endsAt"
          name="endsAt"
          type="datetime-local"
          required
          defaultValue={defaultEndsAt}
          aria-invalid={!!fieldError(state.fieldErrors, "endsAt")}
        />
        {fieldError(state.fieldErrors, "endsAt") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "endsAt")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell)}>
        <Label htmlFor="location">Location (offline)</Label>
        <Input
          id="location"
          name="location"
          maxLength={500}
          placeholder="Address or venue name"
          defaultValue={
            props.mode === "edit" ? props.event.location ?? "" : ""
          }
          aria-invalid={!!fieldError(state.fieldErrors, "location")}
        />
        {fieldError(state.fieldErrors, "location") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "location")}
          </p>
        )}
      </div>

      <div className={cn(fieldShell)}>
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
            props.mode === "edit" && props.event.capacity != null
              ? String(props.event.capacity)
              : ""
          }
          aria-invalid={!!fieldError(state.fieldErrors, "capacity")}
        />
        {fieldError(state.fieldErrors, "capacity") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "capacity")}
          </p>
        )}
      </div>

      {state.message && (
        <p className={cn("text-destructive text-sm", span2)}>{state.message}</p>
      )}

      <div
        className={cn(
          span2,
          "flex",
          props.mode === "edit" ? "justify-end" : "justify-start",
        )}
      >
        <Button
          type="submit"
          disabled={pending}
          className={
            props.mode === "edit"
              ? "min-w-32 shrink-0"
              : "mt-1 w-full min-w-44 sm:w-auto"
          }
        >
          {pending
            ? "Saving…"
            : props.mode === "create"
              ? "Create event"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
