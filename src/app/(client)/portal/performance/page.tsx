import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/sparkline";
import {
  clientById,
  clientSummary,
  creativesByClient,
} from "@/lib/fixtures";
import { CURRENT_PORTAL_CLIENT_ID } from "@/lib/portal";
import { gbp, num } from "@/lib/format";

export const metadata = { title: "Performance" };

export default function PortalPerformancePage() {
  const client = clientById[CURRENT_PORTAL_CLIENT_ID];
  const summary = clientSummary(client.id);
  const enquiriesMtd = Math.round(summary.leads7d * 4.3);
  const spendMtd = summary.spend7d * 4.3;
  const cpe = enquiriesMtd > 0 ? spendMtd / enquiriesMtd : 0;

  const creatives = creativesByClient[client.id] ?? [];
  const perf = creatives.reduce(
    (a, c) => {
      if (!c.performance) return a;
      return {
        impressions: a.impressions + c.performance.impressions,
        clicks: a.clicks + c.performance.clicks,
      };
    },
    { impressions: 0, clicks: 0 },
  );

  const seed = [...client.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const enqTrend = Array.from({ length: 30 }, (_, i) => {
    const j = ((seed * (i + 5)) % 29) / 29;
    return Math.max(0, enquiriesMtd / 30 + (j - 0.5) * (enquiriesMtd / 8));
  });
  const spendTrend = Array.from({ length: 30 }, (_, i) => {
    const j = ((seed * (i + 11)) % 23) / 23;
    return Math.max(1, spendMtd / 30 + (j - 0.5) * (spendMtd / 6));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
        <p className="text-sm text-muted-foreground">
          How your ads are doing this month. No jargon — just the numbers that
          matter.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BigStat label="New enquiries" value={num(enquiriesMtd)} help="People who filled your form, called, or enquired from an ad this month." />
        <BigStat label="Cost per enquiry" value={gbp(cpe, true)} help="What you pay on average for each new enquiry." />
        <BigStat label="Total spent" value={gbp(spendMtd)} help="Across all ad sets and platforms." />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">New enquiries · last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline data={enqTrend} height={120} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Spend · last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline data={spendTrend} height={120} />
          </CardContent>
        </Card>
      </div>

      {/* Reach block */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Reach this month</CardTitle>
          <p className="text-xs text-muted-foreground">
            How many people saw and clicked on your ads.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <ReachStat label="People reached" value={num(Math.round(perf.impressions * 4.3 / 1.2))} />
          <ReachStat label="Ad impressions" value={num(Math.round(perf.impressions * 4.3))} />
          <ReachStat label="Clicks" value={num(Math.round(perf.clicks * 4.3))} />
        </CardContent>
      </Card>

      {/* Agent narrative */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What&apos;s happening
          </div>
          <p className="text-sm leading-relaxed">
            Invisalign is your strongest performer — lowest cost-per-enquiry and
            highest volume. We&apos;re protecting its budget. Veneers enquiries
            dipped in the last week; we&apos;re rotating in fresh creatives
            mid-week, and they should be in your Approvals tab shortly.
          </p>
          <p className="text-sm leading-relaxed">
            Overall you&apos;re pacing ahead of target for the month — ~11% more
            enquiries at a slightly lower cost per enquiry than March.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BigStat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-2 text-[11px] text-muted-foreground">{help}</div>
      </CardContent>
    </Card>
  );
}

function ReachStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
