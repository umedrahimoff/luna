import { EventFormat } from "@prisma/client";

const dateFmt = new Intl.DateTimeFormat("en-US", {
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

/** Public / detail: human-readable start–end range. */
export function formatEventDateRange(
  startsAt: Date,
  endsAt?: Date | null,
): string {
  if (endsAt == null) return formatEventDate(startsAt);
  if (startsAt.getTime() >= endsAt.getTime()) {
    return formatEventDate(startsAt);
  }
  const sameDay = startsAt.toDateString() === endsAt.toDateString();
  if (sameDay) {
    const dayOnlyFmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${dayOnlyFmt.format(startsAt)}, ${formatEventTime(startsAt)} – ${formatEventTime(endsAt)}`;
  }
  return `${formatEventDate(startsAt)} – ${formatEventDate(endsAt)}`;
}

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

/** List card time (Luma-style). */
export function formatEventTime(d: Date): string {
  return timeFmt.format(d);
}

const listDateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Short date under time on list cards. */
export function formatEventListDate(d: Date): string {
  return listDateFmt.format(d);
}

/** Compact line for list cards (start–end). */
export function formatEventCardWhen(
  startsAt: Date,
  endsAt?: Date | null,
): string {
  if (endsAt == null) {
    return `${formatEventTime(startsAt)} · ${formatEventListDate(startsAt)}`;
  }
  if (startsAt.getTime() >= endsAt.getTime()) {
    return `${formatEventTime(startsAt)} · ${formatEventListDate(startsAt)}`;
  }
  const sameDay = startsAt.toDateString() === endsAt.toDateString();
  if (sameDay) {
    return `${formatEventTime(startsAt)}–${formatEventTime(endsAt)} · ${formatEventListDate(startsAt)}`;
  }
  return `${formatEventListDate(startsAt)} ${formatEventTime(startsAt)} → ${formatEventListDate(endsAt)} ${formatEventTime(endsAt)}`;
}

export function formatLabel(format: EventFormat): string {
  return format === EventFormat.ONLINE ? "Online" : "Offline";
}

/** Value for input[type=datetime-local]. Accepts Date, ISO string (RSC → client), or empty. */
export function toDatetimeLocalValue(
  d: Date | string | null | undefined,
): string {
  if (d == null || d === "") return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const day = pad(dt.getDate());
  const h = pad(dt.getHours());
  const min = pad(dt.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}
