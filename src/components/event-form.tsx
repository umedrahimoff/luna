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
import Link from "next/link";

export type EventCategoryOption = { id: string; name: string };

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

  const afterRedirect =
    props.mode === "edit" ? props.afterUpdateRedirect : undefined;

  if (props.categories.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
        <p className="text-foreground font-medium">Нет категорий</p>
        <p className="mt-2">
          Сначала глобальный администратор должен добавить категории в{" "}
          <Link href="/admin/categories" className="text-primary underline">
            панели администратора
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {afterRedirect ? (
        <input type="hidden" name="_redirect" value={afterRedirect} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="categoryId">Категория</Label>
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
            "border-input bg-background min-h-11 w-full rounded-xl border px-4 py-3 text-base shadow-xs outline-none",
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

      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
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

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
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

      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Обложка (ссылка на изображение)</Label>
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
          Квадрат <strong className="font-medium text-foreground">1:1</strong>{" "}
          смотрится лучше всего. Можно оставить пустым — будет плейсхолдер.
        </p>
        {fieldError(state.fieldErrors, "coverImageUrl") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "coverImageUrl")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startsAt">Дата и время</Label>
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

      <div className="space-y-2">
        <Label htmlFor="format">Формат</Label>
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
            "border-input bg-background min-h-11 w-full rounded-xl border px-4 py-3 text-base shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
          )}
        >
          <option value={EventFormat.ONLINE}>Онлайн</option>
          <option value={EventFormat.OFFLINE}>Офлайн</option>
        </select>
        {fieldError(state.fieldErrors, "format") && (
          <p className="text-destructive text-sm">
            {fieldError(state.fieldErrors, "format")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Локация (для офлайна)</Label>
        <Input
          id="location"
          name="location"
          maxLength={500}
          placeholder="Адрес или название площадки"
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

      <div className="space-y-2">
        <Label htmlFor="capacity">Лимит участников (необязательно)</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="Без лимита"
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
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 w-full sm:w-auto sm:min-w-44"
      >
        {pending
          ? "Сохранение…"
          : props.mode === "create"
            ? "Создать событие"
            : "Сохранить изменения"}
      </Button>
    </form>
  );
}
