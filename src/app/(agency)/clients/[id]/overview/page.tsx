import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/kpi-card";
import { Funnel, type FunnelStage } from "@/components/common/funnel";
import { ConnectionPills } from "@/components/common/connection-pills";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  agentActivity,
  campaignsByClient,
  clientById,
  clientSummary,
  creativesByClient,
} from "@/lib/fixtures";
import { gbp, num, pct, relativeTime } from "@/lib/format";

export const metadata = { title: "Overview" };

export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();

  const summary = clientSummary(id);
  const clientCampaigns = campaignsByClient[id] ?? [];
  const clientCreatives = creativesByClient[id] ?? [];
  const liveCreatives = clientCreatives.filter(
    (c) => c.status === "live" && c.performance,
  );
  const clientActivity = agentActivity
    .filter((a) => a.clientId === id || !a.clientId)
    .slice(0, 6);

  // Month-to-date: synthesise as ~last-7d * 4.3 for a 30-day equivalent.
  // Keeps fixtures consistent without needing daily granularity.
  const spendMtd = summary.spend7d * 4.3;
  const leadsMtd = Math.round(summary.leads7d * 4.3);
  const cplMtd = leadsMtd > 0 ? spendMtd / leadsMtd : 0;

  // Trend points (7-day) derived deterministically from campaign spend.
  const seed = [...id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const spendTrend = Array.from({ length: 14 }, (_, i) => {
    const j = ((seed * (i + 7)) % 23) / 23;
    return Math.max(1, summary.spend7d / 7 + (j - 0.5) * (summary.spend7d / 5));
  });
  const leadsTrend = Array.from({ length: 14 }, (_, i) => {
    const j = ((seed * (i + 11)) % 19) / 19;
    return Math.max(0, summary.leads7d / 7 + (j - 0.5) * (summary.leads7d / 4));
  });

  // Funnel values: aggregate across all creatives with performance.
  const perf = clientCreatives.reduce(
    (a, c) => {
      if (!c.performance) return a;
      return {
        impressions: a.impressions + c.performance.impressions,
        clicks: a.clicks + c.performance.clicks,
        leads: a.leads + c.performance.leads,
      };
    },
    { impressions: 0, clicks: 0, leads: 0 },
  );
  const funnelStages: FunnelStage[] = [
    { label: "Impressions", value: perf.impressions },
    { label: "Clicks", value: perf.clicks },
    { label: "Leads", value: perf.leads },
    { label: "Booked", value: 0, pending: true },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link href={`/clients/${id}/creatives?matrix=open`}>
            <Sparkles className="h-3.5 w-3.5" /> Generate creatives
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/clients/${id}/campaigns/new`}>
            <Plus className="h-3.5 w-3.5" /> New campaign
          </Link>
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Spend · MTD"
          value={gbp(spendMtd)}
          delta={8.2}
          trend={spendTrend}
          footer="Last 30 days"
        />
        <KpiCard
          label="Leads · MTD"
          value={num(leadsMtd)}
          delta={11.5}
          trend={leadsTrend}
          footer="Last 30 days"
        />
        <KpiCard
          label="CPL · MTD"
          value={leadsMtd > 0 ? gbp(cplMtd, true) : "—"}
          delta={-3.1}
          invertGood
          footer={`Target £${Math.round(client.monthlyBudget / 80)}`}
        />
        <KpiCard
          label="Active campaigns"
          value={num(summary.activeCampaigns)}
          footer={`${clientCampaigns.length} total on this client`}
        />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Funnel · last 7 days</CardTitle>
          <p className="text-xs text-muted-foreground">
            Aggregated across every live creative for {client.name}. Connect an
            appointment system to wire up the final stage.
          </p>
        </CardHeader>
        <CardContent>
          <Funnel stages={funnelStages} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live ads */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium">Live creatives</CardTitle>
              <p className="text-xs text-muted-foreground">
                {liveCreatives.length} running right now
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/clients/${id}/creatives`}>See all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {liveCreatives.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No live creatives yet. Generate a batch from the matrix to get started.
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {liveCreatives.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/clients/${id}/creatives/${c.id}`}
                    className="flex w-[130px] shrink-0 flex-col gap-1.5"
                  >
                    <CreativeThumbnail creative={c} size="sm" />
                    <div className="line-clamp-1 text-[11px] font-medium">
                      {c.copy.headlines[0]}
                    </div>
                    <div className="flex items-center justify-between text-[11px] tabular-nums">
                      <span>CTR {pct(c.performance?.ctr ?? 0)}</span>
                      <span className="text-muted-foreground">
                        {gbp(c.performance?.spend ?? 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Agent activity</CardTitle>
            <p className="text-xs text-muted-foreground">Recent actions</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {clientActivity.map((a) => (
                <li key={a.id} className="flex gap-2.5 text-sm">
                  <time
                    className="w-14 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground"
                    dateTime={a.timestamp}
                  >
                    {relativeTime(a.timestamp)}
                  </time>
                  <div className="flex-1 text-sm leading-snug">{a.summary}</div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Connection health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-medium">Connection health</CardTitle>
            <p className="text-xs text-muted-foreground">
              Meta, Google and pixel status. Ads can&apos;t launch while a
              required connection is missing.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/clients/${id}/connections`}>Manage</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ConnectionPills connections={client.connections} />
        </CardContent>
      </Card>
    </div>
  );
}
