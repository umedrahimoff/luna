"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  pending = false,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="bg-background/70 absolute inset-0 cursor-default backdrop-blur-sm"
        aria-hidden
        onClick={() => !pending && onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "border-border bg-card text-card-foreground relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl border p-5 shadow-xl ring-1 ring-black/5",
        )}
      >
        <div className="flex flex-col gap-1.5">
          <h2
            id={titleId}
            className="text-foreground flex items-start gap-2 text-base font-semibold tracking-tight"
          >
            {variant === "destructive" ? (
              <span className="bg-destructive/15 text-destructive mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
            ) : null}
            <span className="min-w-0 flex-1 leading-snug">{title}</span>
          </h2>
          {description ? (
            <p id={descId} className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => void onConfirm()}
          >
            {pending ? "Please wait…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
