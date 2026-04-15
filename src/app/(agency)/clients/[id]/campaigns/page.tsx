import Link from "next/link";
import { notFound } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  campaignsByClient,
  clientById,
  type Campaign,
} from "@/lib/fixtures";
import { gbp, num, pct, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Campaigns" };

type Platform = "all" | "meta" | "google";
type StatusFilter = "all" | "active" | "paused" | "draft";

export default async function ClientCampaignsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ platform?: string; status?: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const sp = await searchParams;

  const platform: Platform =
    sp.platform === "google" || sp.platform === "all" || sp.platform === "meta"
      ? sp.platform
      : "all";
  const status: StatusFilter =
    sp.status === "active" ||
    sp.status === "paused" ||
    sp.status === "draft" ||
    sp.status === "all"
      ? sp.status
      : "all";

  const all = campaignsByClient[id] ?? [];
  const filtered = all
    .filter((c) => (platform === "all" ? true : c.platform === platform))
    .filter((c) => (status === "all" ? true : c.status === status));

  const counts = {
    meta: all.filter((c) => c.platform === "meta").length,
    google: all.filter((c) => c.platform === "google").length,
    all: all.length,
  };

  const summary = filtered.reduce(
    (acc, c) => ({ spend: acc.spend + c.spend7d, leads: acc.leads + c.leads7d }),
    { spend: 0, leads: 0 },
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm tabular-nums">
            <span className="font-semibold">{filtered.length}</span>{" "}
            <span className="text-muted-foreground">of {all.length} campaigns</span>
          </div>
          <div className="mt-0.5 flex gap-3 text-xs text-muted-foreground tabular-nums">
            <span>Spend 7d {gbp(summary.spend)}</span>
            <span>Leads 7d {num(summary.leads)}</span>
            <span>
              Avg CPL {summary.leads > 0 ? gbp(summary.spend / summary.leads, true) : "—"}
            </span>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={`/clients/${id}/campaigns/new`}>
            <Plus className="h-3.5 w-3.5" /> New campaign
          </Link>
        </Button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1 border-b -mb-px">
        <PlatformTab label="All" count={counts.all} to={platformHref(id, "all", status)} active={platform === "all"} />
        <PlatformTab label="Meta" count={counts.meta} to={platformHref(id, "meta", status)} active={platform === "meta"} />
        <PlatformTab label="Google" count={counts.google} to={platformHref(id, "google", status)} active={platform === "google"} />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        <StatusPill label="All" count={all.filter((c) => platform === "all" || c.platform === platform).length} to={statusHref(id, platform, "all")} active={status === "all"} />
        <StatusPill label="Active" count={all.filter((c) => (platform === "all" || c.platform === platform) && c.status === "active").length} to={statusHref(id, platform, "active")} active={status === "active"} />
        <StatusPill label="Paused" count={all.filter((c) => (platform === "all" || c.platform === platform) && c.status === "paused").length} to={statusHref(id, platform, "paused")} active={status === "paused"} />
        <StatusPill label="Draft" count={all.filter((c) => (platform === "all" || c.platform === platform) && c.status === "draft").length} to={statusHref(id, platform, "draft")} active={status === "draft"} />
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No campaigns match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Campaign</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Objective</th>
                    <th className="px-3 py-2 font-medium text-right">Budget</th>
                    <th className="px-3 py-2 font-medium text-right">Spend 7d</th>
                    <th className="px-3 py-2 font-medium text-right">Leads</th>
                    <th className="px-3 py-2 font-medium text-right">CPL</th>
                    <th className="px-3 py-2 font-medium text-right">CTR</th>
                    <th className="px-3 py-2 font-medium">Updated</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <CampaignRow key={c.id} campaign={c} />
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

function platformHref(id: string, platform: Platform, status: StatusFilter) {
  const params = new URLSearchParams();
  if (platform !== "all") params.set("platform", platform);
  if (status !== "all") params.set("status", status);
  const q = params.toString();
  return `/clients/${id}/campaigns${q ? `?${q}` : ""}`;
}
function statusHref(id: string, platform: Platform, status: StatusFilter) {
  const params = new URLSearchParams();
  if (platform !== "all") params.set("platform", platform);
  if (status !== "all") params.set("status", status);
  const q = params.toString();
  return `/clients/${id}/campaigns${q ? `?${q}` : ""}`;
}

function PlatformTab({ label, count, to, active }: { label: string; count: number; to: string; active: boolean }) {
  return (
    <Link
      href={to}
      className={cn(
        "border-b-2 px-3 py-2 text-sm",
        active ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">{count}</span>
    </Link>
  );
}

function StatusPill({ label, count, to, active }: { label: string; count: number; to: string; active: boolean }) {
  return (
    <Link
      href={to}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        active ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted",
      )}
    >
      <span>{label}</span>
      <span className={cn("rounded-full px-1 text-[10px] tabular-nums", active ? "bg-background/20" : "bg-muted text-muted-foreground")}>{count}</span>
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const adsCount = campaign.adSets.reduce((s, a) => s + a.creativeIds.length, 0);
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30">
      <td className="py-2.5 pl-4 pr-3">
        <Link href={`/campaigns/${campaign.id}`} className="block">
          <div className="font-medium">{campaign.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {campaign.adSets.length} ad set{campaign.adSets.length === 1 ? "" : "s"} · {adsCount} ads ·{" "}
            {campaign.platform === "meta" ? "Meta" : "Google"} · {campaign.budgetStrategy === "cbo" ? "CBO" : "Ad-set budget"}
          </div>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <CampaignStatusBadge status={campaign.status} />
      </td>
      <td className="px-3 py-2.5 text-xs capitalize text-muted-foreground">{campaign.objective}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">{gbp(campaign.dailyBudget)}/day</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{gbp(campaign.spend7d)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.leads7d}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.leads7d > 0 ? gbp(campaign.cpl, true) : "—"}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{campaign.ctr > 0 ? pct(campaign.ctr, 2) : "—"}</td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground">{relativeTime(campaign.updatedAt)}</td>
      <td className="py-2.5 pr-3 pl-1 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/campaigns/${campaign.id}`}>View detail</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>{campaign.status === "active" ? "Pause" : "Resume"}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  const map: Record<Campaign["status"], string> = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-muted text-muted-foreground border-border",
    draft: "bg-warning/20 text-warning-foreground border-warning/40",
  };
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium capitalize", map[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "active" ? "bg-success" : status === "paused" ? "bg-muted-foreground/50" : "bg-warning")} />
      {status}
    </span>
  );
}
