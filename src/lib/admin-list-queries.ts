import type { Prisma, UserRole } from "@prisma/client";

const MAX_Q = 200;

export function normalizeAdminListQuery(raw: string | undefined): string {
  const s = (raw ?? "").trim().slice(0, MAX_Q);
  return s;
}

export function eventListWhere(input: {
  q: string;
  format?: string;
  categoryId?: string;
  period?: string;
}): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};
  if (input.q) {
    where.OR = [
      { title: { contains: input.q } },
      { description: { contains: input.q } },
    ];
  }
  if (input.format === "ONLINE" || input.format === "OFFLINE") {
    where.format = input.format;
  }
  if (input.categoryId) {
    const cid = Number.parseInt(input.categoryId, 10);
    if (!Number.isNaN(cid)) {
      where.categoryId = cid;
    }
  }
  const now = new Date();
  if (input.period === "upcoming") {
    where.startsAt = { gte: now };
  } else if (input.period === "past") {
    where.startsAt = { lt: now };
  }
  return where;
}

export function userListWhere(input: {
  q: string;
  role?: string;
}): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (input.q) {
    where.OR = [
      { name: { contains: input.q } },
      { email: { contains: input.q } },
    ];
  }
  if (
    input.role === "USER" ||
    input.role === "MODERATOR" ||
    input.role === "ADMIN"
  ) {
    where.role = input.role as UserRole;
  }
  return where;
}

export function registrationListWhere(
  eventId: number,
  q: string,
): Prisma.RegistrationWhereInput {
  const base: Prisma.RegistrationWhereInput = { eventId };
  if (!q) return base;
  return {
    AND: [
      { eventId },
      {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      },
    ],
  };
}
