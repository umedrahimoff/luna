import { cn } from "@/lib/utils";

export type AdminTechnicalField = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
};

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
      <h3 className="text-muted-foreground border-border/60 mb-3 border-b pb-2 text-[10px] font-semibold tracking-wider uppercase">
        {heading}
      </h3>
      <dl className="space-y-3">
        {fields.map((row, i) => (
          <div key={i}>
            <dt className="text-muted-foreground text-xs leading-tight">
              {row.label}
            </dt>
            <dd
              className={cn(
                "text-foreground mt-0.5 text-sm font-medium leading-snug",
                row.mono &&
                  "break-all font-mono text-[0.65rem] font-normal tracking-tight",
              )}
            >
              {row.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {note ? (
        <p className="text-muted-foreground border-border/50 mt-4 border-t pt-3 text-xs leading-relaxed">
          {note}
        </p>
      ) : null}
    </div>
  );
}
