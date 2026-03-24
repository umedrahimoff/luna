"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Building2, CheckSquare, CircleHelp, Link2, List, Smartphone, TextCursorInput, UserRound, X } from "lucide-react";
import { addRegistrationQuestion, deleteRegistrationQuestion, type QuestionsActionState } from "@/app/actions/registration-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type QuestionRow = {
  id: number;
  type: string;
  label: string;
  placeholder: string | null;
  optionsJson: unknown;
  required: boolean;
};

type Props = {
  eventId: number;
  questions: QuestionRow[];
};

const initial: QuestionsActionState = { ok: false };

const QUESTION_TYPES = [
  { key: "text", label: "Text", icon: TextCursorInput },
  { key: "options", label: "Options", icon: List },
  { key: "social", label: "Social Profile", icon: UserRound },
  { key: "company", label: "Company", icon: Building2 },
  { key: "checkbox", label: "Checkbox", icon: CheckSquare },
  { key: "terms", label: "Terms", icon: CircleHelp },
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "website", label: "Website", icon: Link2 },
] as const;

export function AdminEventRegistrationQuestionsSection({ eventId, questions }: Props) {
  const action = useMemo(() => addRegistrationQuestion.bind(null, eventId), [eventId]);
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<(typeof QUESTION_TYPES)[number]["key"]>("text");

  useEffect(() => {
    if (open && state.ok) {
      setOpen(false);
    }
  }, [open, state.ok]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Add custom fields for registration form.
      </p>

      <div className="flex justify-start">
        <Button type="button" onClick={() => setOpen(true)}>
          Add question
        </Button>
      </div>

      {state.message ? (
        <p className={state.ok ? "text-primary text-sm" : "text-destructive text-sm"}>
          {state.message}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="bg-background/70 absolute inset-0 cursor-default backdrop-blur-sm"
            aria-hidden
            onClick={() => !pending && setOpen(false)}
          />
          <div className="border-border bg-card relative z-10 flex w-full max-w-2xl flex-col gap-4 rounded-3xl border p-5 shadow-xl sm:p-6">
            <button
              type="button"
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-2"
              onClick={() => !pending && setOpen(false)}
            >
              <X className="size-5" />
            </button>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Add Question</h3>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUESTION_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSelectedType(t.key)}
                    className={cn(
                      "border-border bg-background hover:bg-accent/40 flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      selectedType === t.key && "ring-primary/35 ring-2",
                    )}
                  >
                    <Icon className="text-muted-foreground size-5" />
                    <span className="text-base font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="hidden" name="type" value={selectedType} />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rq-label">Question label</Label>
                <Input
                  id="rq-label"
                  name="label"
                  placeholder="What should attendees answer?"
                  maxLength={180}
                />
                {state.fieldErrors?.label?.[0] ? (
                  <p className="text-destructive text-xs">{state.fieldErrors.label[0]}</p>
                ) : null}
              </div>
              <label className="text-sm inline-flex items-center gap-2">
                <input type="checkbox" name="required" className="size-4" />
                Required
              </label>
              <div className="flex items-end justify-end gap-2 sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Type</th>
              <th className="p-2.5 font-medium">Question</th>
              <th className="p-2.5 font-medium">Required</th>
              <th className="p-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b last:border-0">
                <td className="p-2.5 capitalize">{q.type}</td>
                <td className="p-2.5">{q.label}</td>
                <td className="p-2.5">{q.required ? "Yes" : "No"}</td>
                <td className="p-2.5">
                  <form action={deleteRegistrationQuestion.bind(null, eventId, q.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {questions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No questions yet.</p>
      ) : null}
    </div>
  );
}
