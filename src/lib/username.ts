/** Paths that must not be used as public usernames (single segment). */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "discover",
  "events",
  "login",
  "me",
  "register",
  "static",
  "u",
  "_next",
]);

export type ParseUsernameResult =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

/** Empty input clears public username; otherwise validates slug format. */
export function parsePublicUsername(input: string): ParseUsernameResult {
  const u = input.trim().toLowerCase();
  if (u === "") {
    return { ok: true, value: null };
  }
  if (!/^[a-z0-9_]{3,30}$/.test(u)) {
    return {
      ok: false,
      message:
        "Use 3–30 characters: lowercase letters, digits, and underscores only.",
    };
  }
  if (RESERVED_USERNAMES.has(u)) {
    return { ok: false, message: "This username is reserved." };
  }
  return { ok: true, value: u };
}
