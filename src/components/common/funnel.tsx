import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FunnelStage = {
  label: string;
  value: number;
  /** Display formatter for the value (defaults to toLocaleString). */
  format?: (n: number) => string;
  /** When true, stage is theoretical/not-connected — shown muted with a note. */
  pending?: boolean;
};

export function Funnel({
  stages,
  className,
}: {
  stages: FunnelStage[];
  className?: string;
}) {
  const fmt = (n: number, stage: FunnelStage) =>
    stage.format ? stage.format(n) : n.toLocaleString();
  const first = stages[0]?.value ?? 0;

  return (
    <div className={cn("flex flex-wrap items-stretch gap-2", className)}>
      {stages.map((stage, i) => {
        const prev = i === 0 ? null : stages[i - 1];
        const conversion =
          prev && prev.value > 0 ? (stage.value / prev.value) * 100 : null;
        const fromTop = first > 0 ? (stage.value / first) * 100 : 0;
        return (
          <div key={stage.label} className="flex flex-1 items-stretch gap-2 min-w-[140px]">
            <div
              className={cn(
                "relative flex-1 overflow-hidden rounded-md border bg-card p-3",
                stage.pending && "opacity-60",
              )}
            >
              {/* fill bar */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 bg-accent/70"
                style={{ width: `${Math.min(100, fromTop)}%` }}
              />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {stage.label}
                </div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums">
                  {stage.pending ? "—" : fmt(stage.value, stage)}
                </div>
                {conversion !== null && !stage.pending ? (
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {conversion.toFixed(1)}% of {prev!.label.toLowerCase()}
                  </div>
                ) : stage.pending ? (
                  <div className="text-[11px] text-muted-foreground">
                    Not connected
                  </div>
                ) : null}
              </div>
            </div>
            {i < stages.length - 1 ? (
              <div className="flex items-center text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
