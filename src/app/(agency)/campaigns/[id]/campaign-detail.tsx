import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import { Funnel, type FunnelStage } from "@/components/common/funnel";
import { KpiCard } from "@/components/common/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  agentActivity,
  agentProposals,
  clientById,
  creativeById,
  creativesByCampaign,
  type AdSet,
  type Campaign,
  type Creative,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { gbp, num, pct, relativeTime } from "@/lib/format";

type CampaignDetailScope = "cross-client" | "client";

type CampaignDetailViewProps = {
  campaign: Campaign;
  scope: CampaignDetailScope;
};

export function CampaignDetailView({
  campaign,
  scope,
}: CampaignDetailViewProps) {
  const client = clientById[campaign.clientId];
  const linkedCreativeIds = creativesByCampaign[campaign.id] ?? [];
  const linkedCreatives = linkedCreativeIds
    .map((id) => creativeById[id])
    .filter(Boolean);
  const adSetStats = campaign.adSets.map((adSet) => ({
    adSet,
    creatives: adSet.creativeIds.map((id) => creativeById[id]).filter(Boolean),
  }));

  const totals = sumCreativePerformance(linkedCreatives);
  const funnelStages: FunnelStage[] = [
    { label: "Impressions", value: totals.impressions },
    { label: "Clicks", value: totals.clicks },
    { label: "Leads", value: totals.leads },
    { label: "Booked", value: 0, pending: true },
  ];
  const adCount = campaign.adSets.reduce((sum, adSet) => sum + adSet.creativeIds.length, 0);
  const trend = buildTrend(campaign.id, campaign.spend7d, campaign.leads7d);
  const relatedProposals = agentProposals.filter((proposal) =>
    proposal.clientId === campaign.clientId &&
    (proposal.affectedCreativeIds.some((id) => linkedCreativeIds.includes(id)) ||
      proposal.proposedCreativeIds?.some((id) => linkedCreativeIds.includes(id)) ||
      proposal.headline.includes(campaign.name) ||
      proposal.reasoning.includes(campaign.name)),
  );
  const relatedActivity = agentActivity.filter(
    (item) =>
      item.summary.includes(campaign.name) ||
      (item.clientId === campaign.clientId &&
        relatedProposals.some((proposal) =>
          proposal.headline.includes(item.summary.split("—")[1]?.trim() ?? ""),
        )),
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {scope === "client" ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link
              href={`/clients/${client.id}/campaigns`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to campaigns
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{campaign.name}</h2>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {campaign.platform === "meta" ? "Meta" : "Google"} · {campaign.objective} ·
              updated {relativeTime(campaign.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients/${client.id}/creatives?matrix=open`}>
                <Sparkles className="h-3.5 w-3.5" />
                Generate creatives
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Spend · 7 days"
          value={gbp(campaign.spend7d)}
          trend={trend.spend}
          footer={`${gbp(campaign.dailyBudget)}/day budget`}
        />
        <KpiCard
          label="Leads · 7 days"
          value={num(campaign.leads7d)}
          trend={trend.leads}
          footer={`${campaign.adSets.length} ad set${campaign.adSets.length === 1 ? "" : "s"}`}
        />
        <KpiCard
          label="CPL · 7 days"
          value={campaign.leads7d > 0 ? gbp(campaign.cpl, true) : "—"}
          invertGood
          footer={campaign.objective === "leads" ? "Lead objective" : "Monitor against target"}
        />
        <KpiCard
          label="CTR · 7 days"
          value={campaign.ctr > 0 ? pct(campaign.ctr, 2) : "—"}
          footer={`${adCount} linked ad${adCount === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Funnel · last 7 days</CardTitle>
            <p className="text-xs text-muted-foreground">
              Aggregated from the creatives currently attached to this campaign.
            </p>
          </CardHeader>
          <CardContent>
            <Funnel stages={funnelStages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Setup</CardTitle>
            <p className="text-xs text-muted-foreground">
              Campaign configuration and routing context.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <SpecRow label="Client" value={client.name} />
            <SpecRow label="Platform" value={campaign.platform === "meta" ? "Meta" : "Google"} />
            <SpecRow label="Objective" value={capitalize(campaign.objective)} />
            <SpecRow
              label="Budget strategy"
              value={campaign.budgetStrategy === "cbo" ? "Campaign budget optimisation" : "Per ad set"}
            />
            <SpecRow label="Daily budget" value={`${gbp(campaign.dailyBudget)}/day`} />
            <SpecRow label="Updated" value={relativeTime(campaign.updatedAt)} />
            {scope === "cross-client" ? (
              <div className="border-t pt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/clients/${client.id}/campaigns/${campaign.id}`}>
                    Open in client workspace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ad sets and ads</CardTitle>
          <p className="text-xs text-muted-foreground">
            Hierarchy for this campaign, with each ad set’s creatives nested below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {adSetStats.map(({ adSet, creatives }) => {
            const adSetPerf = sumCreativePerformance(creatives);
            return (
              <div key={adSet.id} className="rounded-lg border bg-card">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{adSet.name}</div>
                      <AdSetStatusBadge status={adSet.status} />
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                      <MetaChip>{placementLabel(adSet.placements)}</MetaChip>
                      <MetaChip>{audienceLabel(adSet.audienceType)}</MetaChip>
                      <MetaChip>
                        Ages {adSet.ageMin}-{adSet.ageMax}
                      </MetaChip>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs tabular-nums sm:grid-cols-4">
                    <MiniMetric label="Budget" value={adSet.dailyBudget > 0 ? `${gbp(adSet.dailyBudget)}/day` : "Uses CBO"} />
                    <MiniMetric label="Spend" value={gbp(adSetPerf.spend)} />
                    <MiniMetric label="Leads" value={num(adSetPerf.leads)} />
                    <MiniMetric label="CTR" value={adSetPerf.ctr > 0 ? pct(adSetPerf.ctr, 2) : "—"} />
                  </div>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  {creatives.map((creative) => (
                    <Link
                      key={creative.id}
                      href={creativeHref(creative.id, client.id, scope)}
                      className="group space-y-2"
                    >
                      <CreativeThumbnail creative={creative} size="md" className="w-full max-w-none" />
                      <div className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                        {creative.copy.headlines[0]}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                        <span>{creative.performance ? gbp(creative.performance.spend) : "Draft"}</span>
                        <span>{creative.performance ? `CTR ${pct(creative.performance.ctr)}` : "Not live"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium">Linked creatives</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ads currently attached to this campaign.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={scope === "client" ? `/clients/${client.id}/creatives` : `/creatives?client=${client.id}`}>
                See all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {linkedCreatives.map((creative) => (
                <Link
                  key={creative.id}
                  href={creativeHref(creative.id, client.id, scope)}
                  className="group rounded-lg border p-2 transition-colors hover:bg-muted/20"
                >
                  <CreativeThumbnail creative={creative} size="md" className="w-full max-w-none" />
                  <div className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-primary">
                    {creative.copy.headlines[0]}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>{creative.performance ? gbp(creative.performance.cpl, true) : "—"}</span>
                    <span>{creative.performance ? `${creative.performance.leads} leads` : "Draft"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Agent notes</CardTitle>
            <p className="text-xs text-muted-foreground">
              Proposals and activity tied to this campaign.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatedProposals.length > 0 ? (
              <div className="space-y-3">
                {relatedProposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-md border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{proposal.headline}</div>
                      <UrgencyPill urgency={proposal.urgency} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {proposal.reasoning}
                    </p>
                    {proposal.impactEstimate ? (
                      <div className="mt-2 text-[11px] font-medium text-foreground">
                        {proposal.impactEstimate}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No campaign-specific proposals right now.
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent activity
              </div>
              {(relatedActivity.length > 0 ? relatedActivity : agentActivity.filter((item) => item.clientId === client.id).slice(0, 3)).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="leading-snug">{item.summary}</div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">
                    {relativeTime(item.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function creativeHref(
  creativeId: string,
  clientId: string,
  scope: CampaignDetailScope,
) {
  return scope === "client"
    ? `/clients/${clientId}/creatives/${creativeId}`
    : `/creatives/${creativeId}`;
}

function sumCreativePerformance(creatives: Creative[]) {
  const totals = creatives.reduce(
    (acc, creative) => {
      if (!creative.performance) return acc;
      return {
        impressions: acc.impressions + creative.performance.impressions,
        clicks: acc.clicks + creative.performance.clicks,
        spend: acc.spend + creative.performance.spend,
        leads: acc.leads + creative.performance.leads,
      };
    },
    { impressions: 0, clicks: 0, spend: 0, leads: 0 },
  );
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
  return {
    ...totals,
    ctr: Math.round(ctr * 100) / 100,
    cpl: Math.round(cpl * 100) / 100,
  };
}

function buildTrend(id: string, spend: number, leads: number) {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const spendTrend = Array.from({ length: 14 }, (_, i) => {
    const wave = ((seed * (i + 3)) % 19) / 19;
    return Math.max(1, spend / 7 + (wave - 0.5) * Math.max(4, spend / 6));
  });
  const leadsTrend = Array.from({ length: 14 }, (_, i) => {
    const wave = ((seed * (i + 5)) % 13) / 13;
    return Math.max(0, leads / 7 + (wave - 0.5) * Math.max(1, leads / 3));
  });
  return { spend: spendTrend, leads: leadsTrend };
}

function placementLabel(placements: AdSet["placements"]) {
  switch (placements) {
    case "feed":
      return "Feed";
    case "stories-reels":
      return "Stories & reels";
    default:
      return "Mixed placements";
  }
}

function audienceLabel(audienceType: AdSet["audienceType"]) {
  switch (audienceType) {
    case "advantage-plus":
      return "Advantage+";
    case "custom":
      return "Custom audience";
    case "lookalike":
      return "Lookalike";
    case "retargeting":
      return "Retargeting";
  }
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-right font-medium">{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border bg-card px-1.5 py-0.5">
      {children}
    </span>
  );
}

function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  const map: Record<Campaign["status"], string> = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-muted text-muted-foreground border-border",
    draft: "bg-warning/20 text-warning-foreground border-warning/40",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium capitalize",
        map[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active"
            ? "bg-success"
            : status === "paused"
              ? "bg-muted-foreground/50"
              : "bg-warning",
        )}
      />
      {status}
    </span>
  );
}

function AdSetStatusBadge({ status }: { status: AdSet["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium capitalize",
        status === "active"
          ? "bg-success/15 text-success border-success/30"
          : "bg-muted text-muted-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}

function UrgencyPill({ urgency }: { urgency: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning-foreground border-warning/40",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium capitalize",
        map[urgency],
      )}
    >
      {urgency}
    </span>
  );
}
