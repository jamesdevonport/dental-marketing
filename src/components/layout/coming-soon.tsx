import { Sparkles } from "lucide-react";

type Phase = 1 | 2 | 3 | 4 | 5;

const PHASE_LABEL: Record<Phase, string> = {
  1: "Phase 1 · shell scaffolding complete",
  2: "Phase 2 · first must-have screen",
  3: "Phase 3 · client workspace",
  4: "Phase 4 · agent & generator surfaces",
  5: "Phase 5 · settings & client portal",
};

export function ComingSoon({
  title,
  description,
  bullets,
  phase = 2,
}: {
  title: string;
  description: string;
  bullets?: string[];
  phase?: Phase;
}) {
  return (
    <div className="p-4 md:p-6">
      <div className="rounded-lg border border-dashed bg-muted/20 p-6 md:p-10">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{PHASE_LABEL[phase]}</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {bullets?.length ? (
            <ul className="space-y-1.5 text-sm text-muted-foreground/90">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
