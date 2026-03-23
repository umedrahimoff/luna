import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function hasCategoryDelegate(client: PrismaClient): boolean {
  return typeof (client as unknown as { category?: { findMany?: unknown } })
    .category?.findMany === "function";
}

function hasUserDelegate(client: PrismaClient): boolean {
  return typeof (client as unknown as { user?: { findMany?: unknown } }).user
    ?.findMany === "function";
}

function hasCountryDelegate(client: PrismaClient): boolean {
  return typeof (client as unknown as { country?: { findMany?: unknown } })
    .country?.findMany === "function";
}

function assertClientComplete(client: PrismaClient): void {
  if (
    !hasCategoryDelegate(client) ||
    !hasUserDelegate(client) ||
    !hasCountryDelegate(client)
  ) {
    throw new Error(
      "Prisma Client is out of date. Run: npx prisma generate && restart the dev server.",
    );
  }
}

function resolveClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    if (!globalForPrisma.prisma) {
      const c = createClient();
      assertClientComplete(c);
      globalForPrisma.prisma = c;
    }
    return globalForPrisma.prisma;
  }

  const cached = globalForPrisma.prisma;
  if (
    cached &&
    hasCategoryDelegate(cached) &&
    hasUserDelegate(cached) &&
    hasCountryDelegate(cached)
  ) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect();
    globalForPrisma.prisma = undefined;
  }
  const fresh = createClient();
  assertClientComplete(fresh);
  globalForPrisma.prisma = fresh;
  return fresh;
}

/** Proxy: in dev, after `prisma generate`, pick up fresh client instead of stale cached one. */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = resolveClient();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
