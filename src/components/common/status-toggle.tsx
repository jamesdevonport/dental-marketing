"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Status = "active" | "paused";

/**
 * Inline Active / Paused switch for table rows. Optimistic local state only —
 * no server round-trip (wireframe). Renders a small label alongside the switch.
 */
export function StatusToggle({
  initial,
  onChange,
  compact,
  disabled,
  className,
}: {
  initial: Status;
  onChange?: (next: Status) => void;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>(initial);

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-xs",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <Switch
        checked={status === "active"}
        onCheckedChange={(on: boolean) => {
          const next: Status = on ? "active" : "paused";
          setStatus(next);
          onChange?.(next);
        }}
        disabled={disabled}
      />
      {!compact && (
        <span
          className={cn(
            "font-medium capitalize",
            status === "active" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {status}
        </span>
      )}
    </label>
  );
}
