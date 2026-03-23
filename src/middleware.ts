import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "luna_organizer_id";
const HEADER = "x-luna-organizer-id";
const MAX_AGE = 60 * 60 * 24 * 400;

export function middleware(request: NextRequest) {
  let organizerId = request.cookies.get(COOKIE)?.value;
  const isNew = !organizerId;
  if (!organizerId) organizerId = crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADER, organizerId);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (isNew) {
    res.cookies.set(COOKIE, organizerId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE,
      path: "/",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
