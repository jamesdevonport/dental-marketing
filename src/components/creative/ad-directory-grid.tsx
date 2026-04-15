"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Grid2x2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreativeThumbnail } from "./thumbnail";
import { MatrixGenerator } from "./matrix-generator";
import { StatusBadge, ApprovalBadge } from "@/components/common/status-badge";
import { FacetRail, type FacetGroupDef } from "@/components/common/facet-rail";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import {
  clientById,
  clients,
  personaById,
  templateById,
  topicById,
  type Creative,
} from "@/lib/fixtures";
import { gbp, pct, relativeTime } from "@/lib/format";

export type AdDirectoryScope =
  | { kind: "cross-client" }
  | { kind: "client"; clientId: string };

type FilterKey =
  | "format"
  | "template"
  | "topic"
  | "persona"
  | "approval"
  | "status"
  | "client";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "best", label: "Best performing (CPL)" },
  { value: "worst", label: "Worst performing (CPL)" },
  { value: "spend", label: "Most spend" },
  { value: "alpha", label: "A → Z" },
];

export function AdDirectoryGrid({
  creatives,
  scope,
}: {
  creatives: Creative[];
  scope: AdDirectoryScope;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: Record<FilterKey, Set<string>> = {
    format: parseList(searchParams.get("format")),
    template: parseList(searchParams.get("template")),
    topic: parseList(searchParams.get("topic")),
    persona: parseList(searchParams.get("persona")),
    approval: parseList(searchParams.get("approval")),
    status: parseList(searchParams.get("status")),
    client: parseList(searchParams.get("client")),
  };
  const sort = searchParams.get("sort") ?? "newest";
  const view = (searchParams.get("view") ?? "grid") as "grid" | "list";
  const matrixOpen = searchParams.get("matrix") === "open";

  // ---- filter + sort ---------------------------------------------------
  const filtered = useMemo(() => {
    return creatives.filter((c) => {
      if (filters.format.size > 0 && !filters.format.has(c.format)) return false;
      if (filters.template.size > 0 && !filters.template.has(c.templateId)) return false;
      if (filters.topic.size > 0 && !filters.topic.has(c.topicId)) return false;
      if (filters.persona.size > 0 && !filters.persona.has(c.personaId)) return false;
      if (filters.approval.size > 0 && !filters.approval.has(c.approvalState)) return false;
      if (filters.status.size > 0 && !filters.status.has(c.status)) return false;
      if (scope.kind === "cross-client" && filters.client.size > 0 && !filters.client.has(c.clientId)) return false;
      return true;
    });
  }, [creatives, filters, scope.kind]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "best":
        return list.sort(
          (a, b) => (a.performance?.cpl ?? 9999) - (b.performance?.cpl ?? 9999),
        );
      case "worst":
        return list.sort(
          (a, b) => (b.performance?.cpl ?? 0) - (a.performance?.cpl ?? 0),
        );
      case "spend":
        return list.sort(
          (a, b) => (b.performance?.spend ?? 0) - (a.performance?.spend ?? 0),
        );
      case "alpha":
        return list.sort((a, b) =>
          (a.copy.headlines[0] ?? "").localeCompare(b.copy.headlines[0] ?? ""),
        );
      default:
        return list.sort(
          (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
        );
    }
  }, [filtered, sort]);

  // ---- facet groups (counts computed against full creatives list) -------
  const facetGroups: FacetGroupDef[] = useMemo(() => {
    const groups: FacetGroupDef[] = [
      {
        id: "format",
        label: "Format",
        options: [
          { value: "feed", label: "Feed" },
          { value: "story", label: "Story" },
          { value: "link", label: "Link" },
        ].map((o) => ({ ...o, count: countBy(creatives, (c) => c.format === o.value) })),
      },
      {
        id: "template",
        label: "Template",
        options: Array.from(new Set(creatives.map((c) => c.templateId))).map((id) => ({
          value: id,
          label: templateById[id].name,
          count: countBy(creatives, (c) => c.templateId === id),
        })),
      },
      {
        id: "topic",
        label: "Topic",
        options: Array.from(new Set(creatives.map((c) => c.topicId))).map((id) => ({
          value: id,
          label: topicById[id]?.name ?? id,
          count: countBy(creatives, (c) => c.topicId === id),
        })),
      },
      {
        id: "persona",
        label: "Persona",
        options: Array.from(new Set(creatives.map((c) => c.personaId))).map((id) => ({
          value: id,
          label: personaById[id]?.name ?? id,
          count: countBy(creatives, (c) => c.personaId === id),
        })),
        initialOpen: false,
      },
      {
        id: "approval",
        label: "Approval",
        options: [
          { value: "approved", label: "Approved" },
          { value: "awaiting_agency", label: "Awaiting agency" },
          { value: "awaiting_client", label: "Awaiting client" },
          { value: "rejected", label: "Rejected" },
          { value: "not_required", label: "Not required" },
        ].map((o) => ({ ...o, count: countBy(creatives, (c) => c.approvalState === o.value) })),
      },
      {
        id: "status",
        label: "Status",
        options: [
          { value: "live", label: "Live" },
          { value: "paused", label: "Paused" },
          { value: "draft", label: "Draft" },
          { value: "archived", label: "Archived" },
        ].map((o) => ({ ...o, count: countBy(creatives, (c) => c.status === o.value) })),
      },
    ];
    if (scope.kind === "cross-client") {
      groups.splice(0, 0, {
        id: "client",
        label: "Client",
        options: clients.map((c) => ({
          value: c.id,
          label: c.name,
          count: countBy(creatives, (cr) => cr.clientId === c.id),
        })),
      });
    }
    return groups;
  }, [creatives, scope.kind]);

  const onFacetChange = (groupId: string, values: string[]) => {
    const next = new URLSearchParams(searchParams.toString());
    if (values.length === 0) next.delete(groupId);
    else next.set(groupId, values.join(","));
    router.replace(`${pathname}?${next.toString()}`);
  };

  const setQuery = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  const setMatrix = (open: boolean) => setQuery({ matrix: open ? "open" : null });

  // ---- bulk select ------------------------------------------------------
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelected = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const hasAnyFilter =
    Object.values(filters).some((s) => s.size > 0) || sort !== "newest";

  return (
    <>
      <div className="flex gap-6 p-4 md:p-6">
        <FacetRail
          groups={facetGroups}
          selected={Object.fromEntries(
            Object.entries(filters).map(([k, v]) => [k, Array.from(v)]),
          )}
          onChange={onFacetChange}
        />
        <div className="min-w-0 flex-1 space-y-3">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums">
                <span className="font-semibold">{sorted.length}</span>
                <span className="text-muted-foreground"> of {creatives.length}</span>
              </span>
              {hasAnyFilter ? (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => router.replace(pathname)}
                >
                  <X className="h-3 w-3" /> Clear filters
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sort}
                onValueChange={(v: string | null) => {
                  if (v) setQuery({ sort: v === "newest" ? null : v });
                }}
              >
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex rounded-md border p-0.5">
                <ViewToggle
                  active={view === "grid"}
                  onClick={() => setQuery({ view: view === "grid" ? null : "grid" })}
                  label="Grid"
                  icon={LayoutGrid}
                />
                <ViewToggle
                  active={view === "list"}
                  onClick={() => setQuery({ view: "list" })}
                  label="List"
                  icon={List}
                />
              </div>
              <Button size="sm" onClick={() => setMatrix(true)}>
                <Sparkles className="h-3.5 w-3.5" /> Generate
              </Button>
            </div>
          </div>

          {/* Selection bar */}
          {selected.size > 0 ? (
            <div className="flex items-center justify-between rounded-md border bg-accent px-3 py-1.5 text-sm">
              <span className="font-medium">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="xs">
                  Launch as ads
                </Button>
                <Button variant="ghost" size="xs">
                  Pause
                </Button>
                <Button variant="ghost" size="xs">
                  Duplicate
                </Button>
                <Button variant="ghost" size="xs">
                  Export
                </Button>
                <Button variant="ghost" size="xs" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          ) : null}

          {/* Results */}
          {sorted.length === 0 ? (
            <EmptyState
              icon={<Grid2x2 className="h-4 w-4" />}
              title="No creatives match these filters"
              description="Loosen a facet or clear filters to see more."
              action={
                hasAnyFilter ? (
                  <Button size="sm" variant="outline" onClick={() => router.replace(pathname)}>
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setMatrix(true)}>
                    <Sparkles className="h-3.5 w-3.5" /> Generate creatives
                  </Button>
                )
              }
              className="mt-8"
            />
          ) : view === "grid" ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sorted.map((c) => (
                <CreativeTile
                  key={c.id}
                  creative={c}
                  selected={selected.has(c.id)}
                  onToggleSelect={() => toggleSelected(c.id)}
                  showClient={scope.kind === "cross-client"}
                />
              ))}
            </div>
          ) : (
            <CreativeList
              creatives={sorted}
              selected={selected}
              toggleSelected={toggleSelected}
              showClient={scope.kind === "cross-client"}
            />
          )}
        </div>
      </div>
      <MatrixGenerator
        open={matrixOpen}
        onOpenChange={setMatrix}
        initialClientId={scope.kind === "client" ? scope.clientId : undefined}
      />
    </>
  );
}

function CreativeTile({
  creative,
  selected,
  onToggleSelect,
  showClient,
}: {
  creative: Creative;
  selected: boolean;
  onToggleSelect: () => void;
  showClient: boolean;
}) {
  const template = templateById[creative.templateId];
  const topic = topicById[creative.topicId];
  const persona = personaById[creative.personaId];
  const client = clientById[creative.clientId];

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-2 transition-shadow hover:shadow-md",
        selected && "ring-2 ring-primary",
      )}
    >
      <div className="relative">
        {/* select checkbox */}
        <label
          className={cn(
            "absolute left-2 top-2 z-10 grid h-5 w-5 cursor-pointer place-items-center rounded bg-background/90 border",
            (selected || "opacity-0 group-hover:opacity-100") && "transition-opacity",
            selected && "opacity-100 bg-primary border-primary",
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="sr-only"
          />
          {selected ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2 6.5l2.5 2.5L10 3"
                stroke="currentColor"
                className="text-primary-foreground"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          ) : null}
        </label>

        {/* approval badge overlay */}
        {creative.approvalState !== "not_required" && creative.approvalState !== "approved" ? (
          <div className="absolute right-2 top-2 z-10">
            <ApprovalBadge state={creative.approvalState} compact />
          </div>
        ) : null}

        <Link href={`/creatives/${creative.id}`} className="block">
          <CreativeThumbnail creative={creative} size="md" className="w-full max-w-none" />
        </Link>
      </div>

      <div className="mt-2 space-y-1.5 px-0.5">
        <Link
          href={`/creatives/${creative.id}`}
          className="block line-clamp-2 text-[13px] font-medium leading-tight hover:text-primary"
        >
          {creative.copy.headlines[0]}
        </Link>

        <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
          <span className="rounded-full bg-muted px-1.5 py-0.5">{template.name}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5">{topic.name}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5">{persona.name}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={creative.status} />
          {creative.performance ? (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              CPL {gbp(creative.performance.cpl, true)}
            </span>
          ) : null}
        </div>
        {showClient ? (
          <div className="flex items-center gap-1.5 border-t pt-1.5 text-[11px] text-muted-foreground">
            <span
              className="grid h-4 w-4 place-items-center rounded-sm text-[8px] font-semibold text-white"
              style={{ backgroundColor: client.brand.primary }}
            >
              {client.logoInitials}
            </span>
            <span className="truncate">{client.name}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CreativeList({
  creatives,
  selected,
  toggleSelected,
  showClient,
}: {
  creatives: Creative[];
  selected: Set<string>;
  toggleSelected: (id: string) => void;
  showClient: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="w-8 px-2 py-2" />
            <th className="w-[90px] px-2 py-2" />
            <th className="px-2 py-2 font-medium">Headline</th>
            {showClient ? <th className="px-2 py-2 font-medium">Client</th> : null}
            <th className="px-2 py-2 font-medium">Template</th>
            <th className="px-2 py-2 font-medium">Topic</th>
            <th className="px-2 py-2 font-medium">Persona</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 font-medium">Approval</th>
            <th className="px-2 py-2 font-medium text-right">CPL</th>
            <th className="px-2 py-2 font-medium text-right">CTR</th>
            <th className="px-2 py-2 font-medium">Generated</th>
          </tr>
        </thead>
        <tbody>
          {creatives.map((c) => {
            const client = clientById[c.clientId];
            return (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelected(c.id)}
                    className="h-4 w-4 accent-primary"
                  />
                </td>
                <td className="px-2 py-2">
                  <Link href={`/creatives/${c.id}`}>
                    <CreativeThumbnail creative={c} size="sm" className="w-[72px]" />
                  </Link>
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/creatives/${c.id}`}
                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                  >
                    {c.copy.headlines[0]}
                  </Link>
                </td>
                {showClient ? (
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="grid h-4 w-4 place-items-center rounded-sm text-[8px] font-semibold text-white"
                        style={{ backgroundColor: client.brand.primary }}
                      >
                        {client.logoInitials}
                      </span>
                      <span className="text-xs">{client.name}</span>
                    </span>
                  </td>
                ) : null}
                <td className="px-2 py-2 text-xs">{templateById[c.templateId].name}</td>
                <td className="px-2 py-2 text-xs">{topicById[c.topicId]?.name}</td>
                <td className="px-2 py-2 text-xs">{personaById[c.personaId]?.name}</td>
                <td className="px-2 py-2"><StatusBadge status={c.status} /></td>
                <td className="px-2 py-2">
                  {c.approvalState !== "not_required" ? (
                    <ApprovalBadge state={c.approvalState} compact />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {c.performance ? gbp(c.performance.cpl, true) : "—"}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                  {c.performance ? pct(c.performance.ctr) : "—"}
                </td>
                <td className="px-2 py-2 text-xs text-muted-foreground">
                  {relativeTime(c.generatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function parseList(s: string | null): Set<string> {
  if (!s) return new Set();
  return new Set(s.split(",").filter(Boolean));
}

function countBy<T>(list: T[], pred: (item: T) => boolean): number {
  return list.reduce((n, item) => (pred(item) ? n + 1 : n), 0);
}
