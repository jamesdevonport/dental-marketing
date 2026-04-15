import { Card, CardContent } from "@/components/ui/card";
import { MetricDelta } from "./metric-delta";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  invertGood,
  trend,
  footer,
  className,
}: {
  label: string;
  value: string;
  delta?: number;
  invertGood?: boolean;
  trend?: number[];
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="pt-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {delta !== undefined ? (
            <MetricDelta value={delta} invertGood={invertGood} />
          ) : null}
        </div>
        {trend ? (
          <div className="mt-2 h-8">
            <Sparkline data={trend} height={32} />
          </div>
        ) : null}
        {footer ? (
          <div className="mt-1 text-[11px] text-muted-foreground">{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
