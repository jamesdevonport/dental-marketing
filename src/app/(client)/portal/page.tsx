import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/sparkline";
import { MetricDelta } from "@/components/common/metric-delta";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  clientById,
  clientSummary,
  creativesByClient,
} from "@/lib/fixtures";
import { CURRENT_PORTAL_CLIENT_ID } from "@/lib/portal";
import { gbp, num } from "@/lib/format";

export const metadata = { title: "Your ads" };

export default function PortalHomePage() {
  const client = clientById[CURRENT_PORTAL_CLIENT_ID];
  const summary = clientSummary(client.id);
  const creatives = creativesByClient[client.id] ?? [];
  const liveCreatives = creatives.filter((c) => c.status === "live" && c.performance);
  const topCreatives = [...liveCreatives]
    .sort((a, b) => (a.performance!.cpl) - (b.performance!.cpl))
    .slice(0, 3);

  const enquiriesMtd = Math.round(summary.leads7d * 4.3);
  const spendMtd = summary.spend7d * 4.3;
  const cpe = enquiriesMtd > 0 ? spendMtd / enquiriesMtd : 0;

  const awaiting = creatives.filter((c) => c.approvalState === "awaiting_client").length;

  // Deterministic 30-day trend
  const seed = [...client.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const trend = Array.from({ length: 30 }, (_, i) => {
    const j = ((seed * (i + 5)) % 29) / 29;
    return Math.max(0, enquiriesMtd / 30 + (j - 0.5) * (enquiriesMtd / 10));
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-none bg-gradient-to-br from-primary/10 via-accent to-background shadow-none">
        <CardContent className="space-y-3 pt-6 pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            April so far
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            {num(enquiriesMtd)} <span className="text-2xl font-medium text-muted-foreground">new patient enquiries</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            That&apos;s across all your live ads on Meta — lead forms, calls, and
            website enquiries combined. You&apos;re pacing{" "}
            <span className="text-success font-medium">+11% vs last month</span> at{" "}
            <span className="text-foreground font-medium">{gbp(cpe, true)}</span>{" "}
            per enquiry.
          </p>
          {awaiting > 0 ? (
            <Button asChild className="mt-2">
              <Link href="/portal/approvals">
                Review {awaiting} creative{awaiting === 1 ? "" : "s"} waiting for sign-off
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Chart + headline KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Enquiries · last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline data={trend} height={140} />
          </CardContent>
        </Card>
        <div className="space-y-3">
          <MiniKpi label="Enquiries this month" value={num(enquiriesMtd)} delta={11.2} />
          <MiniKpi label="Cost per enquiry" value={gbp(cpe, true)} delta={-4.1} invertGood />
          <MiniKpi label="Spent this month" value={gbp(spendMtd)} delta={7.5} />
        </div>
      </div>

      {/* Top 3 ads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top performing ads this month</CardTitle>
          <p className="text-xs text-muted-foreground">
            Lowest cost-per-enquiry. These are the ones driving the most
            enquiries for the money.
          </p>
        </CardHeader>
        <CardContent>
          {topCreatives.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No live creatives yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {topCreatives.map((c) => (
                <Link key={c.id} href="/portal/creatives" className="space-y-2 group">
                  <CreativeThumbnail creative={c} size="md" className="w-full max-w-none" />
                  <div className="space-y-0.5">
                    <div className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                      {c.copy.headlines[0]}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      Cost per enquiry {gbp(c.performance!.cpl, true)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent note */}
      <Card className="bg-muted/30">
        <CardContent className="flex gap-3 pt-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
            AI
          </div>
          <div className="text-sm leading-relaxed">
            <p className="mb-1 font-medium">A quick note from your account agent</p>
            <p className="text-muted-foreground">
              Invisalign is pulling strong this month — we&apos;re letting it
              spend. Whitening enquiries are down, so we&apos;re refreshing that
              creative set this week; you&apos;ll see new mockups in the
              Approvals tab. No action needed unless you want to steer things.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" className="ml-auto shrink-0" aria-label="Message">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniKpi({
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
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <div className="text-xl font-semibold tabular-nums">{value}</div>
          {delta !== undefined ? <MetricDelta value={delta} invertGood={invertGood} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
