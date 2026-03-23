import { randomBytes } from "crypto";

/** Length and alphabet similar to Luma links (`/g8cg1t5e`). */
export const EVENT_PUBLIC_CODE_LENGTH = 8;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Path segment `/{code}` — exactly 8 lowercase letters/digits. */
export const EVENT_PUBLIC_CODE_REGEX = /^[a-z0-9]{8}$/;

export function isValidEventPublicCode(raw: string): boolean {
  return EVENT_PUBLIC_CODE_REGEX.test(raw);
}

export function generateEventPublicCode(): string {
  const bytes = randomBytes(EVENT_PUBLIC_CODE_LENGTH);
  let s = "";
  for (let i = 0; i < EVENT_PUBLIC_CODE_LENGTH; i++) {
    s += ALPHABET[bytes[i]! % ALPHABET.length]!;
  }
  return s;
}
