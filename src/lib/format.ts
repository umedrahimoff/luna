import { EventFormat } from "@prisma/client";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventDate(d: Date): string {
  return dateFmt.format(d);
}

const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Время для карточки в списке (как на Luma). */
export function formatEventTime(d: Date): string {
  return timeFmt.format(d);
}

const listDateFmt = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Короткая дата под временем на карточке. */
export function formatEventListDate(d: Date): string {
  return listDateFmt.format(d);
}

export function formatLabel(format: EventFormat): string {
  return format === EventFormat.ONLINE ? "Онлайн" : "Офлайн";
}

/** Для value input[type=datetime-local] в локальном времени браузера/сервера */
export function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}
