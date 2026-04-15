"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Pause,
  PlayCircle,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ApprovalBadge } from "@/components/common/status-badge";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import { MetaPreview } from "@/components/creative/meta-preview";
import { cn } from "@/lib/utils";
import {
  clientById,
  creativeById,
  scheduledTasks,
  type AgentProposal,
  type Client,
  type Creative,
  type Urgency,
} from "@/lib/fixtures";
import { relativeTime, timeHHMM } from "@/lib/format";

type Item =
  | { kind: "proposal"; id: string; proposal: AgentProposal }
  | { kind: "creative-review"; id: string; creative: Creative };

type Tab = "pending" | "approved" | "rejected" | "all";

export function AgentInbox({
  proposals,
  awaitingCreatives,
}: {
  proposals: AgentProposal[];
  awaitingCreatives: Creative[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const tab = (sp.get("tab") ?? "pending") as Tab;
  const clientFilter = sp.get("client");
  const selectedProposalId = sp.get("proposal");
  const selectedCreativeId = sp.get("creative");

  // Build merged inbox items
  const items: Item[] = useMemo(() => {
    const propItems: Item[] = proposals
      .filter((p) => {
        if (tab === "pending") return p.status === "pending";
        if (tab === "approved") return p.status === "approved";
        if (tab === "rejected") return p.status === "rejected";
        return true;
      })
      .filter((p) => !clientFilter || p.clientId === clientFilter)
      .map((p) => ({ kind: "proposal", id: p.id, proposal: p }));

    // Creative-review items only surface in "pending" tab (since rejected/approved
    // creatives have already been decided).
    const creativeItems: Item[] =
      tab === "pending" || tab === "all"
        ? awaitingCreatives
            .filter((c) => !clientFilter || c.clientId === clientFilter)
            .map((c) => ({ kind: "creative-review", id: c.id, creative: c }))
        : [];

    return [...propItems, ...creativeItems].sort((a, b) => {
      const ta = a.kind === "proposal" ? a.proposal.createdAt : a.creative.generatedAt;
      const tb = b.kind === "proposal" ? b.proposal.createdAt : b.creative.generatedAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [proposals, awaitingCreatives, tab, clientFilter]);

  // Resolve selection (or default to first item in list)
  const selected: Item | undefined = selectedProposalId
    ? items.find((i) => i.kind === "proposal" && i.id === selectedProposalId)
    : selectedCreativeId
      ? items.find((i) => i.kind === "creative-review" && i.id === selectedCreativeId)
      : items[0];

  const setQuery = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  const selectItem = (item: Item) => {
    if (item.kind === "proposal") {
      setQuery({ proposal: item.id, creative: null });
    } else {
      setQuery({ creative: item.id, proposal: null });
    }
  };

  const uniqueClients = useMemo(() => {
    const ids = new Set<string>();
    for (const i of items) {
      ids.add(i.kind === "proposal" ? i.proposal.clientId : i.creative.clientId);
    }
    return Array.from(ids).map((id) => clientById[id]).filter(Boolean);
  }, [items]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 pt-4 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Agent</h1>
            <p className="text-sm text-muted-foreground">
              Pending proposals, creative reviews, and agent activity.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v: string) => setQuery({ tab: v === "pending" ? null : v })}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All activity</TabsTrigger>
            </TabsList>
          </Tabs>
          {uniqueClients.length > 1 ? (
            <ClientFilter
              clients={uniqueClients}
              active={clientFilter}
              onSelect={(id) => setQuery({ client: id })}
            />
          ) : null}
        </div>
      </div>

      {/* Split pane */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[340px_1fr]">
        <aside className="border-r bg-muted/10 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nothing in this list. Agent has caught up.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    className={cn(
                      "w-full text-left",
                      selected && itemKey(selected) === itemKey(item)
                        ? "bg-accent"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <InboxRow item={item} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="min-w-0 overflow-y-auto">
          {!selected ? (
            <div className="grid h-full place-items-center p-10 text-center text-sm text-muted-foreground">
              Select an item on the left to see details.
            </div>
          ) : selected.kind === "proposal" ? (
            <ProposalDetail proposal={selected.proposal} />
          ) : (
            <CreativeReviewDetail creative={selected.creative} />
          )}
        </section>
      </div>

      {/* Scheduled tasks rail */}
      <div className="border-t bg-muted/20 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Timer className="h-3.5 w-3.5" /> Scheduled tasks
          <Link
            href="/settings/agent"
            className="ml-auto text-[11px] font-normal normal-case tracking-normal text-muted-foreground hover:text-foreground"
          >
            Configure →
          </Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {scheduledTasks.map((t) => (
            <div
              key={t.id}
              className="rounded-md border bg-card px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{t.name}</div>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    t.status === "active"
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.status}
                </span>
              </div>
              <div className="mt-1 text-muted-foreground">{t.cron}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {t.lastRun ? `Last run ${relativeTime(t.lastRun)}` : "Never run"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function itemKey(i: Item) {
  return `${i.kind}-${i.id}`;
}

function InboxRow({ item }: { item: Item }) {
  if (item.kind === "proposal") {
    const p = item.proposal;
    const client = clientById[p.clientId];
    const bar = urgencyBarClass(p.urgency);
    return (
      <div className="flex items-stretch gap-3 p-3">
        <span aria-hidden className={cn("w-1 shrink-0 self-stretch rounded-full", bar)} />
        <span
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[10px] font-semibold text-white"
          style={{ backgroundColor: client.brand.primary }}
        >
          {client.logoInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="line-clamp-2 text-sm font-medium">{p.headline}</div>
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {relativeTime(p.createdAt)}
            </time>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{client.name}</span>
            <span>·</span>
            <span className="capitalize">{p.actionType.replace("-", " ")}</span>
          </div>
        </div>
      </div>
    );
  }

  const c = item.creative;
  const client = clientById[c.clientId];
  return (
    <div className="flex items-stretch gap-3 p-3">
      <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-warning" />
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[10px] font-semibold text-white"
        style={{ backgroundColor: client.brand.primary }}
      >
        {client.logoInitials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="line-clamp-2 text-sm font-medium">
            Review creative: {c.copy.headlines[0]}
          </div>
          <time className="shrink-0 text-[11px] text-muted-foreground">
            {relativeTime(c.generatedAt)}
          </time>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{client.name}</span>
          <span>·</span>
          <span>Creative review</span>
        </div>
      </div>
    </div>
  );
}

function urgencyBarClass(u: Urgency) {
  if (u === "high") return "bg-destructive";
  if (u === "medium") return "bg-warning";
  return "bg-muted-foreground/30";
}

function ClientFilter({
  clients,
  active,
  onSelect,
}: {
  clients: Client[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full px-2 py-0.5",
          !active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
      {clients.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(active === c.id ? null : c.id)}
          className={cn(
            "rounded-full px-2 py-0.5",
            active === c.id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c.name.replace(/ Dental(.*)?/, "")}
        </button>
      ))}
    </div>
  );
}

function ProposalDetail({ proposal }: { proposal: AgentProposal }) {
  const [thread, setThread] = useState(proposal.thread);
  const [message, setMessage] = useState("");
  const client = clientById[proposal.clientId];

  const affectedCreatives = proposal.affectedCreativeIds
    .map((id) => creativeById[id])
    .filter(Boolean);

  const proposedCreatives =
    proposal.proposedCreativeIds?.map((id) => creativeById[id]).filter(Boolean) ?? [];

  const sendMessage = () => {
    if (!message.trim()) return;
    setThread((t) => [
      ...t,
      {
        id: `m-${Date.now()}`,
        author: "user",
        body: message,
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessage("");
  };

  const iconFor = (type: AgentProposal["actionType"]) => {
    switch (type) {
      case "pause": return Pause;
      case "launch": return PlayCircle;
      case "refresh-creative": return Sparkles;
      case "budget-change": return MoreHorizontal;
      case "report": return Clock;
      default: return Sparkles;
    }
  };
  const Icon = iconFor(proposal.actionType);

  return (
    <div className="space-y-5 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {proposal.actionType.replace("-", " ")}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <Link
            href={`/clients/${client.id}/overview`}
            className="text-xs font-medium hover:text-foreground"
          >
            {client.name}
          </Link>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{proposal.headline}</h2>
        <p className="text-sm text-muted-foreground">{proposal.reasoning}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Why</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {proposal.metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between border-b py-1.5 last:border-b-0">
                <dt className="text-xs text-muted-foreground">{m.label}</dt>
                <dd className="text-sm font-medium tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
          {proposal.impactEstimate ? (
            <div className="mt-3 rounded-md bg-success/10 p-3 text-xs text-success">
              <span className="font-semibold">Impact estimate:</span> {proposal.impactEstimate}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {affectedCreatives.length > 0 || proposedCreatives.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {affectedCreatives.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Affected creatives</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {affectedCreatives.map((c) => (
                    <Link key={c.id} href={`/creatives/${c.id}`} className="shrink-0">
                      <CreativeThumbnail creative={c} size="sm" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {proposedCreatives.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Proposed replacements</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {proposedCreatives.map((c) => (
                    <Link key={c.id} href={`/creatives/${c.id}`} className="shrink-0">
                      <CreativeThumbnail creative={c} size="sm" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5" /> Thread
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {thread.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              <div
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                  m.author === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {m.author === "agent" ? "AI" : m.author === "user" ? "JD" : "CL"}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium capitalize">{m.author}</span>
                  <time className="text-[11px] text-muted-foreground">
                    {relativeTime(m.timestamp)}
                  </time>
                </div>
                <p className="mt-0.5 text-sm">{m.body}</p>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Reply to the agent…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={sendMessage} disabled={!message.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky action footer */}
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t bg-background px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info("Deferred 24h.")}
        >
          <Clock className="h-3.5 w-3.5" /> Defer 24h
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Rejected.")}
        >
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Opened edit mode.")}
        >
          Approve with edits
        </Button>
        <Button size="sm" onClick={() => toast.success("Approved & executed.")}>
          <Check className="h-3.5 w-3.5" /> Approve & execute
        </Button>
      </div>
    </div>
  );
}

function CreativeReviewDetail({ creative }: { creative: Creative }) {
  const client = clientById[creative.clientId];
  const [decided, setDecided] = useState<"none" | "approved" | "rejected">("none");

  const approve = () => {
    setDecided("approved");
    if (client.clientApprovalRequired) {
      toast.success(`Approved — sent to ${client.name} for sign-off.`);
    } else {
      toast.success("Approved. Ready to launch.");
    }
  };
  const reject = () => {
    setDecided("rejected");
    toast.info("Rejected. Creative moved to archive.");
  };

  return (
    <div className="space-y-5 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Creative review
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <Link
            href={`/clients/${client.id}/overview`}
            className="text-xs font-medium hover:text-foreground"
          >
            {client.name}
          </Link>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          {creative.copy.headlines[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Generated {relativeTime(creative.generatedAt)} by {creative.generatedBy}.{" "}
          <Link
            href={`/creatives/${creative.id}`}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Open full editor →
          </Link>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Copy variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Headlines</div>
                <ul className="mt-1 space-y-0.5">
                  {creative.copy.headlines.map((h, i) => (
                    <li key={i} className="text-sm">
                      <span className="mr-1.5 text-[11px] font-medium text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Primary text</div>
                <ul className="mt-1 space-y-1">
                  {creative.copy.bodies.map((b, i) => (
                    <li key={i} className="text-sm">{b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Descriptions</div>
                <ul className="mt-1 space-y-0.5">
                  {creative.copy.descriptions.map((d, i) => (
                    <li key={i} className="text-sm">{d}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Destination</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {creative.destination.type === "website" ? (
                <div className="space-y-1">
                  <div><span className="text-muted-foreground">URL:</span> {creative.destination.url}</div>
                  <div className="text-xs text-muted-foreground">
                    UTM: {creative.destination.utm.source} / {creative.destination.utm.medium} / {creative.destination.utm.campaign}
                  </div>
                </div>
              ) : creative.destination.type === "lead_form" ? (
                <div>Lead form: <span className="font-medium">{creative.destination.leadFormName}</span></div>
              ) : (
                <div>Phone call: <span className="font-medium tabular-nums">{creative.destination.phoneNumber}</span></div>
              )}
            </CardContent>
          </Card>
        </div>
        <MetaPreview creative={creative} />
      </div>

      {/* Action footer */}
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t bg-background px-6 py-3">
        {decided === "none" ? (
          <>
            <Button variant="outline" size="sm" onClick={reject}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
            <Button size="sm" asChild variant="outline">
              <Link href={`/creatives/${creative.id}`}>Open full editor</Link>
            </Button>
            <Button size="sm" onClick={approve}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <ApprovalBadge
              state={decided === "approved" ? (client.clientApprovalRequired ? "awaiting_client" : "approved") : "rejected"}
            />
            <span className="text-muted-foreground">Decision recorded.</span>
          </div>
        )}
      </div>
    </div>
  );
}
