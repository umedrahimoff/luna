import { Suspense } from "react";
import { db } from "@/lib/db";
import { splitDisplayName } from "@/lib/display-name";
import { requireUser } from "@/lib/require-user";
import { MePageClient } from "@/components/me/me-page-client";

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
    select: { name: true, email: true, bio: true, username: true, avatarUrl: true },
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
