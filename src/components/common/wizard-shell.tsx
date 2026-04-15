"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  description?: string;
  /** Render the body of this step. `nav.next` is disabled automatically when
   *  `canAdvance` returns false. */
  render: () => ReactNode;
  /** Optional gate — returns true when this step is valid enough to advance. */
  canAdvance?: boolean;
  /** Optional: show a small badge (e.g. item count) on the stepper. */
  badge?: string;
};

export function WizardShell({
  title,
  description,
  steps,
  onFinish,
  onSaveDraft,
  finishLabel = "Launch",
}: {
  title: string;
  description?: string;
  steps: WizardStep[];
  onFinish: () => void;
  onSaveDraft?: () => void;
  finishLabel?: string;
}) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const canAdvance = step?.canAdvance ?? true;

  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      onFinish();
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const back = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            Step {current + 1} of {steps.length}
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Stepper rail */}
        <aside className="border-r bg-muted/10 p-4 md:p-5">
          <ol className="space-y-1">
            {steps.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setCurrent(i)}
                    disabled={i > current} // don't let users skip forward
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                      active && "bg-accent text-accent-foreground",
                      !active && !done && "text-muted-foreground",
                      done && "hover:bg-muted",
                      i > current && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-semibold tabular-nums",
                        done && "bg-primary border-primary text-primary-foreground",
                        active && "bg-foreground border-foreground text-background",
                        !done && !active && "text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{s.label}</span>
                        {s.badge ? (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {s.badge}
                          </span>
                        ) : null}
                      </span>
                      {s.description ? (
                        <span className="block text-[11px] text-muted-foreground">
                          {s.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Step body */}
        <section className="flex flex-1 flex-col">
          <div className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-3xl">{step?.render()}</div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t bg-background px-4 py-3 md:px-6">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
              <div>
                {current > 0 ? (
                  <Button variant="outline" size="sm" onClick={back}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {onSaveDraft ? (
                  <Button variant="ghost" size="sm" onClick={onSaveDraft}>
                    Save & continue later
                  </Button>
                ) : null}
                <Button size="sm" onClick={next} disabled={!canAdvance}>
                  {isLast ? (
                    finishLabel
                  ) : (
                    <>
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
