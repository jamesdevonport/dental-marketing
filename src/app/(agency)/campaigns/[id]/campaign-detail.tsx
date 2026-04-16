"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Edit3,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import { Funnel, type FunnelStage } from "@/components/common/funnel";
import { KpiCard } from "@/components/common/kpi-card";
import { Sparkline } from "@/components/common/sparkline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  agentActivity,
  agentProposals,
  clientById,
  creativeById,
  creativesByCampaign,
  type AdSet,
  type Campaign,
  type Client,
  type Creative,
} from "@/lib/fixtures";
import {
  keywordsFor,
  searchTermsFor,
  type Keyword,
  type MatchType,
  type SearchTerm,
} from "@/lib/google-synth";
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
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const isMeta = campaign.platform === "meta";
  const tab = sp.get("tab") ?? "overview";

  const expandedAdSets = useMemo(() => {
    const raw = sp.get("expanded");
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  }, [sp]);

  const setQuery = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  const setTab = (next: string) =>
    setQuery({ tab: next === "overview" ? null : next });

  const toggleExpanded = (adSetId: string) => {
    const next = new Set(expandedAdSets);
    if (next.has(adSetId)) next.delete(adSetId);
    else next.add(adSetId);
    setQuery({
      expanded: next.size > 0 ? Array.from(next).join(",") : null,
    });
  };

  const client = clientById[campaign.clientId];
  const linkedCreativeIds = creativesByCampaign[campaign.id] ?? [];
  const linkedCreatives = linkedCreativeIds
    .map((id) => creativeById[id])
    .filter(Boolean);
  const adSetStats = campaign.adSets.map((adSet) => ({
    adSet,
    creatives: adSet.creativeIds
      .map((id) => creativeById[id])
      .filter(Boolean) as Creative[],
  }));

  const adCount = campaign.adSets.reduce(
    (sum, adSet) => sum + adSet.creativeIds.length,
    0,
  );
  const trend = buildTrend(campaign.id, campaign.spend7d, campaign.leads7d);

  const adGroupTabLabel = isMeta ? "Ad sets" : "Ad groups";

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
              <h2 className="text-xl font-semibold tracking-tight">
                {campaign.name}
              </h2>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {isMeta ? "Meta" : "Google"} · {campaign.objective} · updated{" "}
              {relativeTime(campaign.updatedAt)}
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

      {/* KPI strip — context for every tab */}
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
          footer={`${campaign.adSets.length} ${
            isMeta ? "ad set" : "ad group"
          }${campaign.adSets.length === 1 ? "" : "s"}`}
        />
        <KpiCard
          label="CPL · 7 days"
          value={campaign.leads7d > 0 ? gbp(campaign.cpl, true) : "—"}
          invertGood
          footer={
            campaign.objective === "leads"
              ? "Lead objective"
              : "Monitor against target"
          }
        />
        <KpiCard
          label="CTR · 7 days"
          value={campaign.ctr > 0 ? pct(campaign.ctr, 2) : "—"}
          footer={`${adCount} linked ad${adCount === 1 ? "" : "s"}`}
        />
      </div>

      <Tabs value={tab} onValueChange={(v: string) => setTab(v)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adsets">{adGroupTabLabel}</TabsTrigger>
          {!isMeta ? (
            <>
              <TabsTrigger value="search-terms">Search terms</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </>
          ) : null}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            campaign={campaign}
            client={client}
            scope={scope}
            linkedCreatives={linkedCreatives}
          />
        </TabsContent>

        <TabsContent value="adsets">
          <AdSetsTab
            campaign={campaign}
            adSetStats={adSetStats}
            expanded={expandedAdSets}
            onToggle={toggleExpanded}
            client={client}
            scope={scope}
          />
        </TabsContent>

        {!isMeta ? (
          <>
            <TabsContent value="search-terms">
              <SearchTermsTab campaign={campaign} />
            </TabsContent>
            <TabsContent value="keywords">
              <KeywordsTab campaign={campaign} />
            </TabsContent>
          </>
        ) : null}

        <TabsContent value="settings">
          <SettingsTab campaign={campaign} client={client} scope={scope} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({
  campaign,
  client,
  scope,
  linkedCreatives,
}: {
  campaign: Campaign;
  client: Client;
  scope: CampaignDetailScope;
  linkedCreatives: Creative[];
}) {
  const totals = sumCreativePerformance(linkedCreatives);
  const funnelStages: FunnelStage[] = [
    { label: "Impressions", value: totals.impressions },
    { label: "Clicks", value: totals.clicks },
    { label: "Leads", value: totals.leads },
    { label: "Booked", value: 0, pending: true },
  ];

  const trend = buildTrend(campaign.id, campaign.spend7d, campaign.leads7d);

  const linkedCreativeIds = linkedCreatives.map((c) => c.id);
  const relatedProposals = agentProposals.filter(
    (proposal) =>
      proposal.clientId === campaign.clientId &&
      (proposal.affectedCreativeIds.some((id) =>
        linkedCreativeIds.includes(id),
      ) ||
        proposal.proposedCreativeIds?.some((id) =>
          linkedCreativeIds.includes(id),
        ) ||
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
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Funnel · last 7 days
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Spend · last 14 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline data={trend.spend} height={120} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-medium">
              Linked creatives
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ads currently attached to this campaign.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={
                scope === "client"
                  ? `/clients/${client.id}/creatives`
                  : `/creatives?client=${client.id}`
              }
            >
              See all
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {linkedCreatives.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No creatives attached yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {linkedCreatives.slice(0, 8).map((creative) => (
                <Link
                  key={creative.id}
                  href={creativeHref(creative.id, client.id, scope)}
                  className="group rounded-lg border p-2 transition-colors hover:bg-muted/20"
                >
                  <CreativeThumbnail
                    creative={creative}
                    size="md"
                    className="w-full max-w-none"
                  />
                  <div className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-primary">
                    {creative.copy.headlines[0]}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>
                      {creative.performance
                        ? gbp(creative.performance.cpl, true)
                        : "—"}
                    </span>
                    <span>
                      {creative.performance
                        ? `${creative.performance.leads} leads`
                        : "Draft"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
                <div
                  key={proposal.id}
                  className="rounded-md border bg-muted/20 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium">
                      {proposal.headline}
                    </div>
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
            {(relatedActivity.length > 0
              ? relatedActivity
              : agentActivity
                  .filter((item) => item.clientId === client.id)
                  .slice(0, 3)
            ).map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
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
  );
}

// ---------------------------------------------------------------------------
// Ad sets / Ad groups tab
// ---------------------------------------------------------------------------

function AdSetsTab({
  campaign,
  adSetStats,
  expanded,
  onToggle,
  client,
  scope,
}: {
  campaign: Campaign;
  adSetStats: { adSet: AdSet; creatives: Creative[] }[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  client: Client;
  scope: CampaignDetailScope;
}) {
  const isMeta = campaign.platform === "meta";
  const totals = sumCreativePerformance(
    adSetStats.flatMap((stat) => stat.creatives),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-3 tabular-nums">
          <span>
            <span className="font-medium text-foreground">
              {adSetStats.length}
            </span>{" "}
            {isMeta ? "ad set" : "ad group"}
            {adSetStats.length === 1 ? "" : "s"}
          </span>
          <span>
            <span className="font-medium text-foreground">
              {adSetStats.reduce((n, s) => n + s.creatives.length, 0)}
            </span>{" "}
            ads
          </span>
          <span>
            Spend{" "}
            <span className="font-medium text-foreground">
              {gbp(totals.spend)}
            </span>
          </span>
          <span>
            Leads{" "}
            <span className="font-medium text-foreground">
              {num(totals.leads)}
            </span>
          </span>
          <span>
            Avg CPL{" "}
            <span className="font-medium text-foreground">
              {totals.leads > 0 ? gbp(totals.cpl, true) : "—"}
            </span>
          </span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/clients/${client.id}/creatives`}>
            <Plus className="h-3.5 w-3.5" /> Attach creatives
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {adSetStats.map(({ adSet, creatives }) => {
          const adSetPerf = sumCreativePerformance(creatives);
          const isExpanded = expanded.has(adSet.id);
          return (
            <AdSetCard
              key={adSet.id}
              adSet={adSet}
              creatives={creatives}
              perf={adSetPerf}
              expanded={isExpanded}
              onToggle={() => onToggle(adSet.id)}
              client={client}
              scope={scope}
              isMeta={isMeta}
            />
          );
        })}
      </div>
    </div>
  );
}

function AdSetCard({
  adSet,
  creatives,
  perf,
  expanded,
  onToggle,
  client,
  scope,
  isMeta,
}: {
  adSet: AdSet;
  creatives: Creative[];
  perf: ReturnType<typeof sumCreativePerformance>;
  expanded: boolean;
  onToggle: () => void;
  client: Client;
  scope: CampaignDetailScope;
  isMeta: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 transition-transform text-muted-foreground",
              !expanded && "-rotate-90",
            )}
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium">{adSet.name}</div>
              <AdSetStatusBadge status={adSet.status} />
            </div>
            <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
              <MetaChip>{placementLabel(adSet.placements)}</MetaChip>
              <MetaChip>{audienceLabel(adSet.audienceType)}</MetaChip>
              <MetaChip>
                Ages {adSet.ageMin}–{adSet.ageMax}
              </MetaChip>
              <MetaChip>
                {creatives.length} ad{creatives.length === 1 ? "" : "s"}
              </MetaChip>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-right text-xs tabular-nums sm:grid-cols-6">
          <MiniMetric
            label="Budget"
            value={
              adSet.dailyBudget > 0 ? `${gbp(adSet.dailyBudget)}/d` : "CBO"
            }
          />
          <MiniMetric label="Spend" value={gbp(perf.spend)} />
          <MiniMetric label="Leads" value={num(perf.leads)} />
          <MiniMetric
            label="CPL"
            value={perf.leads > 0 ? gbp(perf.cpl, true) : "—"}
          />
          <MiniMetric
            label="CTR"
            value={perf.ctr > 0 ? pct(perf.ctr, 2) : "—"}
          />
          <MiniMetric label="Impr." value={num(perf.impressions)} />
        </div>
      </button>
      {expanded ? (
        <div className="border-t bg-muted/10">
          {creatives.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No ads attached to this {isMeta ? "ad set" : "ad group"} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pl-12 pr-3 font-medium">Ad</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium text-right">Spend</th>
                    <th className="px-3 py-2 font-medium text-right">Impr.</th>
                    <th className="px-3 py-2 font-medium text-right">Clicks</th>
                    <th className="px-3 py-2 font-medium text-right">CTR</th>
                    <th className="px-3 py-2 font-medium text-right">Leads</th>
                    <th className="px-3 py-2 font-medium text-right">CPL</th>
                    <th className="px-3 py-2 font-medium text-right">CPM</th>
                    <th className="px-3 py-2 font-medium text-right">Freq</th>
                  </tr>
                </thead>
                <tbody>
                  {creatives.map((c) => {
                    const perf = c.performance;
                    return (
                      <tr
                        key={c.id}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="py-2 pl-12 pr-3">
                          <Link
                            href={creativeHref(c.id, client.id, scope)}
                            className="flex items-start gap-3 group"
                          >
                            <CreativeThumbnail
                              creative={c}
                              size="sm"
                              className="w-[60px] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="line-clamp-1 text-sm font-medium group-hover:text-primary">
                                {c.copy.headlines[0]}
                              </div>
                              <div className="text-[11px] text-muted-foreground capitalize">
                                {c.format} · {c.templateId.replace("-", " ")}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <CreativeStatusPill status={c.status} />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf ? gbp(perf.spend) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf ? num(perf.impressions) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf ? num(perf.clicks) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf ? pct(perf.ctr, 2) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf ? num(perf.leads) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {perf && perf.leads > 0 ? gbp(perf.cpl, true) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {perf ? gbp(perf.cpm, true) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {perf ? perf.frequency.toFixed(2) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search terms tab (Google only)
// ---------------------------------------------------------------------------

function SearchTermsTab({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const filter = sp.get("st") ?? "all";

  const setFilter = (next: string) => {
    const params = new URLSearchParams(sp.toString());
    if (next === "all") params.delete("st");
    else params.set("st", next);
    router.replace(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  };

  const allTerms = useMemo(() => searchTermsFor(campaign), [campaign]);
  const terms = useMemo(() => {
    if (filter === "all") return allTerms;
    return allTerms.filter((t) => t.status === filter);
  }, [allTerms, filter]);

  const totals = allTerms.reduce(
    (acc, t) => ({
      impressions: acc.impressions + t.impressions,
      clicks: acc.clicks + t.clicks,
      cost: acc.cost + t.cost,
      conversions: acc.conversions + t.conversions,
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
  );
  const avgCtr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  const counts = {
    all: allTerms.length,
    added: allTerms.filter((t) => t.status === "added").length,
    not_added: allTerms.filter((t) => t.status === "not_added").length,
    wasteful: allTerms.filter((t) => t.status === "wasteful").length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-5">
          <SummaryStat label="Search terms" value={num(allTerms.length)} />
          <SummaryStat
            label="Impressions"
            value={num(totals.impressions)}
          />
          <SummaryStat label="Clicks" value={num(totals.clicks)} />
          <SummaryStat label="Avg CTR" value={pct(avgCtr, 2)} />
          <SummaryStat label="Cost" value={gbp(totals.cost)} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterPill
          label="All"
          count={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterPill
          label="Added as keyword"
          count={counts.added}
          active={filter === "added"}
          onClick={() => setFilter("added")}
        />
        <FilterPill
          label="Not added"
          count={counts.not_added}
          active={filter === "not_added"}
          onClick={() => setFilter("not_added")}
          tone="warning"
        />
        <FilterPill
          label="Wasteful"
          count={counts.wasteful}
          active={filter === "wasteful"}
          onClick={() => setFilter("wasteful")}
          tone="danger"
        />
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {terms.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No search terms match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Search term</th>
                    <th className="px-3 py-2 font-medium">Matched keyword</th>
                    <th className="px-3 py-2 font-medium text-right">Impr.</th>
                    <th className="px-3 py-2 font-medium text-right">Clicks</th>
                    <th className="px-3 py-2 font-medium text-right">CTR</th>
                    <th className="px-3 py-2 font-medium text-right">Conv.</th>
                    <th className="px-3 py-2 font-medium text-right">Cost</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((t) => (
                    <SearchTermRow key={t.id} term={t} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SearchTermRow({ term }: { term: SearchTerm }) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30">
      <td className="px-4 py-2.5">
        <div className="font-medium">{term.query}</div>
      </td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground">
        {term.matchedKeyword ? (
          <span className="inline-flex items-center gap-1">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              {term.matchedKeyword}
            </code>
            {term.matchType ? (
              <MatchTypeChip matchType={term.matchType} />
            ) : null}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {num(term.impressions)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{num(term.clicks)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {pct(term.ctr, 2)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {num(term.conversions)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {gbp(term.cost, true)}
      </td>
      <td className="px-3 py-2.5">
        <SearchTermStatusCell status={term.status} />
      </td>
    </tr>
  );
}

function SearchTermStatusCell({ status }: { status: SearchTerm["status"] }) {
  if (status === "added") {
    return (
      <span className="inline-flex h-5 items-center gap-1 rounded-full border border-success/30 bg-success/15 px-1.5 text-[11px] font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Added
      </span>
    );
  }
  if (status === "wasteful") {
    return (
      <button
        type="button"
        className="inline-flex h-5 items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/25"
      >
        <Plus className="h-3 w-3" /> Add as negative
      </button>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex h-5 items-center gap-1 rounded-full border border-border bg-card px-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted"
    >
      <Plus className="h-3 w-3" /> Add as keyword
    </button>
  );
}

// ---------------------------------------------------------------------------
// Keywords tab (Google only)
// ---------------------------------------------------------------------------

function KeywordsTab({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filter = sp.get("kw") ?? "all";

  const setFilter = (next: string) => {
    const params = new URLSearchParams(sp.toString());
    if (next === "all") params.delete("kw");
    else params.set("kw", next);
    router.replace(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  };

  const allKeywords = useMemo(() => keywordsFor(campaign), [campaign]);
  const keywords = useMemo(() => {
    if (filter === "all") return allKeywords;
    if (filter === "active" || filter === "paused") {
      return allKeywords.filter((k) => k.status === filter);
    }
    return allKeywords.filter((k) => k.matchType === filter);
  }, [allKeywords, filter]);

  const totals = allKeywords.reduce(
    (acc, k) => ({
      impressions: acc.impressions + k.impressions,
      clicks: acc.clicks + k.clicks,
      cost: acc.cost + k.cost,
      conversions: acc.conversions + k.conversions,
      qsSum: acc.qsSum + k.qualityScore,
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0, qsSum: 0 },
  );
  const avgQs = allKeywords.length > 0 ? totals.qsSum / allKeywords.length : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-5">
          <SummaryStat label="Keywords" value={num(allKeywords.length)} />
          <SummaryStat
            label="Avg Quality Score"
            value={avgQs.toFixed(1)}
            highlight={avgQs >= 7 ? "good" : avgQs >= 5 ? "neutral" : "bad"}
          />
          <SummaryStat
            label="Impressions"
            value={num(totals.impressions)}
          />
          <SummaryStat label="Cost" value={gbp(totals.cost)} />
          <SummaryStat
            label="Conversions"
            value={num(totals.conversions)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterPill
          label="All"
          count={allKeywords.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterPill
          label="Active"
          count={allKeywords.filter((k) => k.status === "active").length}
          active={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <FilterPill
          label="Paused"
          count={allKeywords.filter((k) => k.status === "paused").length}
          active={filter === "paused"}
          onClick={() => setFilter("paused")}
        />
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {(["broad", "phrase", "exact"] as MatchType[]).map((m) => (
          <FilterPill
            key={m}
            label={m.charAt(0).toUpperCase() + m.slice(1)}
            count={allKeywords.filter((k) => k.matchType === m).length}
            active={filter === m}
            onClick={() => setFilter(m)}
          />
        ))}
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {keywords.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No keywords match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Keyword</th>
                    <th className="px-3 py-2 font-medium">Match</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">QS</th>
                    <th className="px-3 py-2 font-medium text-right">Impr.</th>
                    <th className="px-3 py-2 font-medium text-right">Clicks</th>
                    <th className="px-3 py-2 font-medium text-right">CTR</th>
                    <th className="px-3 py-2 font-medium text-right">Avg CPC</th>
                    <th className="px-3 py-2 font-medium text-right">Conv.</th>
                    <th className="px-3 py-2 font-medium text-right">Conv. rate</th>
                    <th className="px-3 py-2 font-medium text-right">Cost</th>
                    <th className="px-3 py-2 font-medium text-right">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k) => (
                    <KeywordRow key={k.id} keyword={k} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KeywordRow({ keyword }: { keyword: Keyword }) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30">
      <td className="px-4 py-2.5">
        <div className="font-mono text-xs">{keyword.keyword}</div>
      </td>
      <td className="px-3 py-2.5">
        <MatchTypeChip matchType={keyword.matchType} />
      </td>
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium capitalize",
            keyword.status === "active"
              ? "bg-success/15 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              keyword.status === "active"
                ? "bg-success"
                : "bg-muted-foreground/50",
            )}
          />
          {keyword.status}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <QualityScoreChip score={keyword.qualityScore} />
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {num(keyword.impressions)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {num(keyword.clicks)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {pct(keyword.ctr, 2)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {gbp(keyword.avgCpc, true)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {num(keyword.conversions)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
        {pct(keyword.conversionRate, 1)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {gbp(keyword.cost)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {keyword.conversions > 0 ? gbp(keyword.cpl, true) : "—"}
      </td>
    </tr>
  );
}

function MatchTypeChip({ matchType }: { matchType: MatchType }) {
  const map: Record<MatchType, { label: string; className: string }> = {
    broad: {
      label: "Broad",
      className: "bg-muted text-muted-foreground border-border",
    },
    phrase: {
      label: "Phrase",
      className: "bg-accent text-accent-foreground border-accent",
    },
    exact: {
      label: "Exact",
      className: "bg-primary/10 text-primary border-primary/20",
    },
  };
  const s = map[matchType];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-medium",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

function QualityScoreChip({ score }: { score: number }) {
  const tone =
    score >= 8
      ? "bg-success/15 text-success border-success/30"
      : score >= 5
        ? "bg-warning/20 text-warning-foreground border-warning/40"
        : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <span
      className={cn(
        "inline-flex h-5 w-7 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
        tone,
      )}
      title="Quality Score 1–10"
    >
      {score}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Settings tab
// ---------------------------------------------------------------------------

function SettingsTab({
  campaign,
  client,
  scope,
}: {
  campaign: Campaign;
  client: Client;
  scope: CampaignDetailScope;
}) {
  const isMeta = campaign.platform === "meta";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Campaign details
            <Button variant="ghost" size="icon-sm" aria-label="Edit">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SpecRow label="Name" value={campaign.name} />
          <SpecRow label="Client" value={client.name} />
          <SpecRow
            label="Platform"
            value={isMeta ? "Meta (Facebook + Instagram)" : "Google Ads"}
          />
          <SpecRow label="Objective" value={capitalize(campaign.objective)} />
          <SpecRow label="Status" value={capitalize(campaign.status)} />
          <SpecRow label="Updated" value={relativeTime(campaign.updatedAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Budget & bidding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SpecRow
            label="Budget strategy"
            value={
              campaign.budgetStrategy === "cbo"
                ? "Campaign budget optimisation"
                : "Per ad set"
            }
          />
          <SpecRow
            label="Daily budget"
            value={`${gbp(campaign.dailyBudget)}/day`}
          />
          <SpecRow
            label="Bid strategy"
            value="Lowest cost (recommended)"
          />
          <SpecRow
            label="Pacing"
            value="Standard"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SpecRow
            label={isMeta ? "Pixel event" : "Conversion action"}
            value={campaign.objective === "leads" ? "Lead" : "Schedule"}
          />
          <SpecRow label="UTM source" value={isMeta ? "meta" : "google"} />
          <SpecRow
            label="UTM medium"
            value={isMeta ? "paid_social" : "cpc"}
          />
          <SpecRow
            label="UTM campaign"
            value={campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          />
          {!isMeta ? (
            <SpecRow label="Network" value="Search + Search partners" />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SpecRow label="Start date" value="01 Apr 2026" />
          <SpecRow label="End date" value="Ongoing" />
          <SpecRow label="Time zone" value="Europe/London" />
          <SpecRow label="Day-parting" value="All hours" />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="text-sm text-muted-foreground">
            Open the campaign builder to make structural changes (objective,
            audience, ad sets).
          </div>
          <div className="flex gap-2">
            {scope === "cross-client" ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/clients/${client.id}/campaigns/${campaign.id}`}>
                  <Target className="h-3.5 w-3.5" /> Open in client workspace
                </Link>
              </Button>
            ) : null}
            <Button size="sm" asChild>
              <Link
                href={
                  scope === "client"
                    ? `/clients/${client.id}/campaigns/new`
                    : "/campaigns/new"
                }
              >
                Edit in builder
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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
  const ctr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
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
    <div className="flex items-start justify-between gap-3 text-sm">
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

function CreativeStatusPill({ status }: { status: Creative["status"] }) {
  const map: Record<Creative["status"], { label: string; className: string }> =
    {
      draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground border-border",
      },
      pending_review: {
        label: "Pending",
        className: "bg-warning/20 text-warning-foreground border-warning/40",
      },
      approved: {
        label: "Approved",
        className: "bg-accent text-accent-foreground border-accent",
      },
      live: {
        label: "Live",
        className: "bg-success/15 text-success border-success/30",
      },
      paused: {
        label: "Paused",
        className: "bg-muted text-muted-foreground border-border",
      },
      archived: {
        label: "Archived",
        className: "bg-muted/40 text-muted-foreground border-border",
      },
    };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

function UrgencyPill({
  urgency,
}: {
  urgency: "high" | "medium" | "low";
}) {
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

function FilterPill({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "warning" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:bg-muted",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1 text-[10px] tabular-nums",
          active
            ? "bg-background/20"
            : tone === "warning"
              ? "bg-warning/20 text-warning-foreground"
              : tone === "danger"
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SummaryStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "good" | "neutral" | "bad";
}) {
  const tone =
    highlight === "good"
      ? "text-success"
      : highlight === "bad"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 text-base font-semibold tabular-nums", tone)}>
        {value}
      </div>
    </div>
  );
}
