import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricDelta } from "@/components/common/metric-delta";
import { Sparkline } from "@/components/common/sparkline";
import { cn } from "@/lib/utils";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  aggregateLast7Days,
  agentProposals,
  agentActivity,
  clients,
  clientById,
  campaigns,
  creatives,
  clientSummary,
} from "@/lib/fixtures";
import { gbp, num, pct, relativeTime, timeHHMM } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const totals = aggregateLast7Days();
  const pending = agentProposals
    .filter((p) => p.status === "pending")
    .slice(0, 5);
  const todayActivity = agentActivity.slice(0, 7);

  const liveCreatives = creatives.filter((c) => c.status === "live" && c.performance);
  const topCreatives = [...liveCreatives]
    .sort((a, b) => (a.performance!.cpl - b.performance!.cpl))
    .slice(0, 5);
  const worstCreatives = [...liveCreatives]
    .filter((c) => c.performance!.leads === 0 || c.performance!.cpl > 30)
    .sort((a, b) => b.performance!.spend - a.performance!.spend)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Book-of-business overview — is anything on fire?"
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/agent">Agent inbox</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/creatives?matrix=open">Generate batch</Link>
            </Button>
          </>
        }
      />
      <div className="space-y-6 p-4 md:p-6">
        <KpiRow totals={totals} />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-medium">Agent inbox</CardTitle>
                <p className="text-xs text-muted-foreground">Pending proposals</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/agent">See all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-0">
              {pending.length === 0 ? (
                <EmptyRow>No pending proposals — agent is happy.</EmptyRow>
              ) : (
                <ul className="-mx-3 divide-y">
                  {pending.map((p) => (
                    <li key={p.id} className="px-3">
                      <ProposalRow proposalId={p.id} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <p className="text-xs text-muted-foreground">Agent activity</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {todayActivity.map((a) => (
                  <li key={a.id} className="flex gap-2.5 text-sm">
                    <time
                      className="w-10 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground"
                      dateTime={a.timestamp}
                    >
                      {timeHHMM(a.timestamp)}
                    </time>
                    <div className="flex-1 text-sm leading-snug">
                      {a.summary}
                      {a.clientId ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          · {clientById[a.clientId]?.name}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium">Performance leaderboard</CardTitle>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/clients">All clients</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Client</th>
                  <th className="px-4 py-2 font-medium text-right">Spend</th>
                  <th className="px-4 py-2 font-medium text-right">Leads</th>
                  <th className="px-4 py-2 font-medium text-right">CPL</th>
                  <th className="px-4 py-2 font-medium">Trend</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const s = clientSummary(c.id);
                  const trend = buildTrend(c.id);
                  return (
                    <tr
                      key={c.id}
                      className="border-b last:border-b-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/clients/${c.id}/overview`}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="grid h-6 w-6 place-items-center rounded-sm text-[10px] font-semibold text-white"
                            style={{ backgroundColor: c.brand.primary }}
                          >
                            {c.logoInitials}
                          </span>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            · {c.city}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {gbp(s.spend7d)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.leads7d}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {s.leads7d > 0 ? gbp(s.cpl, true) : "—"}
                      </td>
                      <td className="px-4 py-3 w-24">
                        <Sparkline data={trend} height={24} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs capitalize">
                          <span
                            className={
                              c.status === "active"
                                ? "h-1.5 w-1.5 rounded-full bg-success"
                                : c.status === "onboarding"
                                  ? "h-1.5 w-1.5 rounded-full bg-warning"
                                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                            }
                          />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top performing creatives</CardTitle>
              <p className="text-xs text-muted-foreground">Lowest CPL this week</p>
            </CardHeader>
            <CardContent>
              <CreativeStrip creativeIds={topCreatives.map((c) => c.id)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Worst performing creatives</CardTitle>
              <p className="text-xs text-muted-foreground">Spending without converting</p>
            </CardHeader>
            <CardContent>
              <CreativeStrip creativeIds={worstCreatives.map((c) => c.id)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function KpiRow({ totals }: { totals: ReturnType<typeof aggregateLast7Days> }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Kpi label="Spend · last 7 days" value={gbp(totals.spend)} delta={6.4} />
      <Kpi
        label="Avg CPL · last 7 days"
        value={totals.leads > 0 ? gbp(totals.cpl, true) : "—"}
        delta={-8.2}
        invertGood
      />
      <Kpi label="Active campaigns" value={num(totals.activeCampaigns)} delta={2.1} />
      <Kpi label="Clients" value={num(totals.clients)} />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  invertGood,
}: {
  label: string;
  value: string;
  delta?: number;
  invertGood?: boolean;
}) {
  return (
    <Card>
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
      </CardContent>
    </Card>
  );
}

function ProposalRow({ proposalId }: { proposalId: string }) {
  const p = agentProposals.find((x) => x.id === proposalId)!;
  const client = clientById[p.clientId];

  const urgencyBar =
    p.urgency === "high"
      ? "bg-destructive"
      : p.urgency === "medium"
        ? "bg-warning"
        : "bg-muted-foreground/30";

  const urgencyLabel =
    p.urgency === "high"
      ? "text-destructive"
      : p.urgency === "medium"
        ? "text-warning-foreground"
        : "text-muted-foreground";

  return (
    <Link
      href={`/agent?proposal=${p.id}`}
      className="flex items-stretch gap-3 py-3"
    >
      <span
        aria-hidden
        className={cn("w-1 shrink-0 self-stretch rounded-full", urgencyBar)}
      />
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[10px] font-semibold text-white"
        style={{ backgroundColor: client.brand.primary }}
      >
        {client.logoInitials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-sm font-medium">{p.headline}</div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {relativeTime(p.createdAt)}
          </time>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{client.name}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{p.actionType.replace("-", " ")}</span>
          <span aria-hidden>·</span>
          <span className={cn("capitalize", urgencyLabel)}>{p.urgency} urgency</span>
        </div>
      </div>
    </Link>
  );
}

function CreativeStrip({ creativeIds }: { creativeIds: string[] }) {
  if (creativeIds.length === 0)
    return <EmptyRow>No creatives to show yet.</EmptyRow>;
  const list = creativeIds.map((id) => creatives.find((c) => c.id === id)!).filter(Boolean);
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {list.map((c) => {
        const client = clientById[c.clientId];
        return (
          <Link
            key={c.id}
            href={`/creatives/${c.id}`}
            className="group flex w-[120px] shrink-0 flex-col gap-1.5"
          >
            <CreativeThumbnail creative={c} size="sm" />
            <div className="text-[11px] text-muted-foreground truncate">{client.name}</div>
            <div className="flex items-center justify-between text-[11px] tabular-nums">
              <span>CTR {pct(c.performance?.ctr ?? 0)}</span>
              <span className="text-muted-foreground">{gbp(c.performance?.spend ?? 0)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6 text-center text-sm text-muted-foreground">{children}</div>
  );
}

function buildTrend(clientId: string): number[] {
  // Deterministic 7-point trend derived from client campaign spend.
  const seed = [...clientId].reduce((n, c) => n + c.charCodeAt(0), 0);
  const base = campaigns
    .filter((c) => c.clientId === clientId)
    .reduce((s, c) => s + c.spend7d, 0);
  const pts: number[] = [];
  for (let i = 0; i < 7; i++) {
    const jitter = ((seed * (i + 3)) % 17) / 17;
    pts.push(Math.max(1, base / 7 + (jitter - 0.5) * (base / 5)));
  }
  return pts;
}
