import { Check, Clock, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalState, CreativeStatus } from "@/lib/fixtures";

export function StatusBadge({
  status,
  className,
}: {
  status: CreativeStatus;
  className?: string;
}) {
  const map: Record<CreativeStatus, { label: string; className: string; dot: string }> = {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground/40",
    },
    pending_review: {
      label: "Pending review",
      className: "bg-warning/20 text-warning-foreground border-warning/40",
      dot: "bg-warning",
    },
    approved: {
      label: "Approved",
      className: "bg-accent text-accent-foreground border-accent",
      dot: "bg-primary",
    },
    live: {
      label: "Live",
      className: "bg-success/15 text-success border-success/30",
      dot: "bg-success",
    },
    paused: {
      label: "Paused",
      className: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground/50",
    },
    archived: {
      label: "Archived",
      className: "bg-muted/40 text-muted-foreground border-border line-through",
      dot: "bg-muted-foreground/30",
    },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium",
        s.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

export function ApprovalBadge({
  state,
  compact,
  className,
}: {
  state: ApprovalState;
  compact?: boolean;
  className?: string;
}) {
  if (state === "not_required") return null;

  const map: Record<
    Exclude<ApprovalState, "not_required">,
    { label: string; short: string; className: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    awaiting_agency: {
      label: "Review by agency",
      short: "Review",
      className: "bg-warning/20 text-warning-foreground border-warning/40",
      icon: Clock,
    },
    awaiting_client: {
      label: "With client",
      short: "With client",
      className: "bg-primary/15 text-primary border-primary/30",
      icon: Lock,
    },
    approved: {
      label: "Approved",
      short: "Approved",
      className: "bg-success/15 text-success border-success/30",
      icon: Check,
    },
    rejected: {
      label: "Rejected",
      short: "Rejected",
      className: "bg-destructive/15 text-destructive border-destructive/30",
      icon: X,
    },
  };
  const s = map[state];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium",
        s.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {compact ? s.short : s.label}
    </span>
  );
}
