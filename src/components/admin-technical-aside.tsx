import { cn } from "@/lib/utils";

export type AdminTechnicalField = {
  label: string;
  value: React.ReactNode;
  /** Technical / code values: monospace, same size as plain text. */
  mono?: boolean;
  /** Muted sub-lines under the main value (email, ids, etc.). */
  detail?: React.ReactNode;
};

const sectionHeadingClass =
  "text-muted-foreground border-border/60 mb-3 border-b pb-2 text-xs font-semibold uppercase tracking-wider";
const labelClass =
  "text-muted-foreground text-xs font-medium leading-tight";
const valueClass = "mt-1 text-sm font-normal leading-snug text-foreground";
const valueMonoClass = "font-mono break-all tabular-nums";
const detailWrapClass =
  "text-muted-foreground mt-1.5 space-y-1 text-xs font-normal leading-relaxed";
const noteClass =
  "text-muted-foreground border-border/50 mt-4 border-t pt-3 text-xs font-normal leading-relaxed";

export function AdminTechnicalAside({
  heading = "Technical details",
  fields,
  note,
}: {
  heading?: string;
  fields: AdminTechnicalField[];
  note?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className={sectionHeadingClass}>{heading}</h3>
      <dl className="space-y-3.5">
        {fields.map((row, i) => (
          <div key={i}>
            <dt className={labelClass}>{row.label}</dt>
            <dd>
              <div
                className={cn(valueClass, row.mono && valueMonoClass)}
              >
                {row.value ?? "—"}
              </div>
              {row.detail ? (
                <div className={detailWrapClass}>{row.detail}</div>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      {note ? <p className={noteClass}>{note}</p> : null}
    </div>
  );
}
