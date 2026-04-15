import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricDelta({
  value,
  invertGood = false,
  className,
}: {
  /** Delta in percent, e.g. 12 for +12%, -8 for -8% */
  value: number;
  /** Set true when lower is better (e.g. CPL, CPA). */
  invertGood?: boolean;
  className?: string;
}) {
  const abs = Math.abs(value);
  if (abs < 0.5) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground",
          className,
        )}
      >
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }

  const positive = value > 0;
  const good = invertGood ? !positive : positive;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
        good
          ? "bg-success/15 text-success"
          : "bg-destructive/15 text-destructive",
        className,
      )}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}
