"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FacetOption = { value: string; label: string; count?: number };

export type FacetGroupDef = {
  id: string;
  label: string;
  options: FacetOption[];
  /** Default open state. */
  initialOpen?: boolean;
};

export function FacetRail({
  groups,
  selected,
  onChange,
  className,
}: {
  groups: FacetGroupDef[];
  /** Map of groupId -> selected values (multi-select). */
  selected: Record<string, string[]>;
  onChange: (groupId: string, values: string[]) => void;
  className?: string;
}) {
  return (
    <aside className={cn("w-56 shrink-0 space-y-4 text-sm", className)}>
      {groups.map((g) => (
        <FacetGroup
          key={g.id}
          group={g}
          selected={selected[g.id] ?? []}
          onChange={(values) => onChange(g.id, values)}
        />
      ))}
    </aside>
  );
}

function FacetGroup({
  group,
  selected,
  onChange,
}: {
  group: FacetGroupDef;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(group.initialOpen ?? true);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open ? (
        <ul className="space-y-0.5">
          {group.options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <li key={opt.value}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-sm hover:bg-muted",
                    checked && "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(opt.value)}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span>{opt.label}</span>
                  </span>
                  {opt.count !== undefined ? (
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {opt.count}
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
