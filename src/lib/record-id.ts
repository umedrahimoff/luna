/** Parse numeric id from URL, form, or bind(...) (DB autoincrement). */
export function parseRecordId(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") {
    return Number.isInteger(raw) && raw >= 1 ? raw : null;
  }
  const s = raw.trim();
  if (!s) return null;
  // Whole decimal string only (not parseInt("12abc") === 12).
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 1 ? n : null;
}
