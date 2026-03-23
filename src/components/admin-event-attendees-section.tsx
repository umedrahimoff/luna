import { AdminListToolbar } from "@/components/admin-list-toolbar";

export type AdminAttendeeRow = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

type Props = {
  /** GET form target (current admin route, no hash). */
  action: string;
  defaultQuery: string;
  resetHref: string;
  showReset: boolean;
  filters: React.ReactNode;
  registrations: AdminAttendeeRow[];
  totalRegs: number;
  searchQuery: string;
};

/** Attendee list + toolbar for admin event detail or edit (same hash #attendees). */
export function AdminEventAttendeesSection({
  action,
  defaultQuery,
  resetHref,
  showReset,
  filters,
  registrations,
  totalRegs,
  searchQuery,
}: Props) {
  return (
    <>
      <p className="text-muted-foreground text-sm">
        People who registered for this event ({totalRegs} total).
      </p>
      <div className="mt-4">
        <AdminListToolbar
          action={action}
          defaultQuery={defaultQuery}
          placeholder="Attendee name or email"
          filters={filters}
          resetHref={resetHref}
          showReset={showReset}
        />
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Name</th>
              <th className="p-2.5 font-medium">Email</th>
              <th className="p-2.5 font-medium">Registered</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-2.5">{r.name}</td>
                <td className="text-muted-foreground p-2.5">{r.email}</td>
                <td className="text-muted-foreground p-2.5 tabular-nums">
                  {r.createdAt.toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {registrations.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">
          {searchQuery
            ? "No matches — try a different search."
            : "No registrations yet."}
        </p>
      ) : null}
      {searchQuery && registrations.length > 0 ? (
        <p className="text-muted-foreground mt-2 text-xs">
          Showing {registrations.length} of {totalRegs} attendees.
        </p>
      ) : null}
    </>
  );
}
