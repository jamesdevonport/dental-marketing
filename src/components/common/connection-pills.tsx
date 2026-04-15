import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/fixtures";

const LABELS: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  pixel: "Pixel",
};

const DOT: Record<ConnectionStatus, string> = {
  connected: "bg-success",
  degraded: "bg-warning",
  missing: "bg-muted-foreground/40",
};

export function ConnectionPills({
  connections,
  className,
}: {
  connections: { meta: ConnectionStatus; google: ConnectionStatus; pixel: ConnectionStatus };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 text-[11px]", className)}>
      {(["meta", "google", "pixel"] as const).map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-full border bg-card px-1.5 py-0.5"
          title={`${LABELS[key]}: ${connections[key]}`}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", DOT[connections[key]])} />
          <span className="text-muted-foreground">{LABELS[key]}</span>
        </span>
      ))}
    </div>
  );
}
