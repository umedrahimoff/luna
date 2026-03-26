/** Unified datetime format in admin aside. */
export function formatAdminEntityDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  });
}
