import { Suspense } from "react";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { splitDisplayName } from "@/lib/display-name";
import { requireUser } from "@/lib/require-user";
import { MePageClient } from "@/components/me/me-page-client";

const PROTECTED_ACCOUNT_EMAIL = "thisisumed@gmail.com";
const PROTECTED_ACCOUNT_EMAIL_NORM = PROTECTED_ACCOUNT_EMAIL
  .trim()
  .toLowerCase();

function MeFallback() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="bg-muted h-8 w-48 rounded-md" />
      <div className="bg-muted h-4 w-full max-w-md rounded-md" />
      <div className="bg-muted mt-4 h-10 w-full rounded-lg" />
      <div className="bg-muted h-40 w-full rounded-xl" />
    </div>
  );
}

async function MeContent() {
  const session = await requireUser();
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      bio: true,
      username: true,
      avatarUrl: true,
      role: true,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const { firstName, lastName } = splitDisplayName(user.name);

  const events = await db.event.findMany({
    where: { userId: session.id },
    orderBy: { startsAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });

  const protectedAccount = await db.user.findFirst({
    where: { email: PROTECTED_ACCOUNT_EMAIL_NORM },
    select: { id: true },
  });
  const isProtectedEmail =
    (user.email ?? "").trim().toLowerCase() === PROTECTED_ACCOUNT_EMAIL_NORM;
  const isProtectedId =
    protectedAccount != null && protectedAccount.id === session.id;
  const adminCount =
    user.role === UserRole.ADMIN
      ? await db.user.count({ where: { role: UserRole.ADMIN } })
      : 0;
  const isLastAdmin = user.role === UserRole.ADMIN && adminCount <= 1;
  const canDeleteAccount = !isProtectedEmail && !isProtectedId && !isLastAdmin;
  const deleteBlockedReason = isProtectedEmail || isProtectedId
    ? "This account is protected and cannot be deleted."
    : isLastAdmin
      ? "You cannot delete the last administrator account."
      : undefined;

  return (
    <MePageClient
      user={{
        firstName,
        lastName,
        email: user.email ?? "",
        bio: user.bio,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }}
      canDeleteAccount={canDeleteAccount}
      deleteBlockedReason={deleteBlockedReason}
      events={events}
    />
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<MeFallback />}>
      <MeContent />
    </Suspense>
  );
}
