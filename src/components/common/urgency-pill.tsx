import { cn } from "@/lib/utils";
import type { Urgency } from "@/lib/fixtures";

export function UrgencyPill({
  urgency,
  className,
}: {
  urgency: Urgency;
  className?: string;
}) {
  const styles: Record<Urgency, string> = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning-foreground border-warning/40",
    low: "bg-muted text-muted-foreground border-border",
  };
  const label: Record<Urgency, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-medium uppercase tracking-wider",
        styles[urgency],
        className,
      )}
    >
      {label[urgency]}
    </span>
  );
}
