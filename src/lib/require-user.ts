import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/user-session";

export async function requireUser(): Promise<
  NonNullable<Awaited<ReturnType<typeof getSessionUser>>>
> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
