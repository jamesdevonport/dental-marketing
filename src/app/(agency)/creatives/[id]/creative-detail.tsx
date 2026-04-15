"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Archive,
  Check,
  Copy,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, ApprovalBadge } from "@/components/common/status-badge";
import { CreativeCopyEditor } from "@/components/creative/copy-editor";
import { DestinationEditor } from "@/components/creative/destination-editor";
import { MetaPreview } from "@/components/creative/meta-preview";
import { Sparkline } from "@/components/common/sparkline";
import { MetricDelta } from "@/components/common/metric-delta";
import { cn } from "@/lib/utils";
import {
  clientById,
  creativesByCampaign,
  campaignById,
  personaById,
  templateById,
  topicById,
  type Creative,
  type CreativeCopy,
  type CreativeDestination,
  type LeadForm,
  type MetaPublishConfig,
} from "@/lib/fixtures";
import { gbp, num, pct, relativeTime } from "@/lib/format";

export function CreativeDetail({
  creative,
  leadForms,
}: {
  creative: Creative;
  leadForms: LeadForm[];
}) {
  const [copy, setCopy] = useState<CreativeCopy>(creative.copy);
  const [destination, setDestination] = useState<CreativeDestination>(
    creative.destination,
  );
  const [publish, setPublish] = useState<MetaPublishConfig>(creative.publish);

  // State-machine derived button cluster — no real mutations in wireframe,
  // just toast-based simulation so the flow reads like the real thing.
  const [state, setState] = useState({
    status: creative.status,
    approvalState: creative.approvalState,
  });

  const client = clientById[creative.clientId];
  const template = templateById[creative.templateId];
  const topic = topicById[creative.topicId];
  const persona = personaById[creative.personaId];

  const previewCreative: Creative = {
    ...creative,
    copy,
    destination,
    publish,
    status: state.status,
    approvalState: state.approvalState,
  };

  // Campaigns this creative is attached to
  const attachedCampaignIds = creative.campaignIds;
  const attachedCampaigns = attachedCampaignIds
    .map((id) => campaignById[id])
    .filter(Boolean);

  const metaConnected = client.connections.meta === "connected";

  return (
    <>
      {/* Header */}
      <div className="border-b bg-background px-4 py-4 md:px-6">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href={`/clients/${client.id}/creatives`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to {client.name} creatives
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {copy.headlines[0] ?? creative.name}
              </h1>
              <StatusBadge status={state.status} />
              <ApprovalBadge state={state.approvalState} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <Link
                href={`/clients/${client.id}/overview`}
                className="hover:text-foreground"
              >
                {client.name}
              </Link>
              {" · "}
              {template.name} · {topic.name} · {persona.name} · {creative.format}
              {" · generated "}
              {relativeTime(creative.generatedAt)} by {creative.generatedBy}
            </p>
          </div>
          <ActionCluster
            status={state.status}
            approvalState={state.approvalState}
            metaConnected={metaConnected}
            clientId={client.id}
            onApproveAgency={() => {
              if (client.clientApprovalRequired) {
                setState({ status: "draft", approvalState: "awaiting_client" });
                toast.success(`Approved — sent to ${client.name} for sign-off.`);
              } else {
                setState({ status: "draft", approvalState: "approved" });
                toast.success("Approved. Ready to launch.");
              }
            }}
            onReject={() => {
              setState({ status: "draft", approvalState: "rejected" });
              toast.info("Rejected. Use Duplicate & edit to try again.");
            }}
            onLaunch={() => {
              setState({ status: "live", approvalState: "approved" });
              toast.success("Publishing to Meta…", { duration: 1200 });
              setTimeout(() => {
                toast.success(`Live — added to ${client.name} campaigns.`);
              }, 1200);
            }}
            onPause={() => {
              setState((s) => ({ ...s, status: "paused" }));
              toast.info("Paused.");
            }}
            onResume={() => {
              setState((s) => ({ ...s, status: "live" }));
              toast.success("Resumed.");
            }}
            onArchive={() => {
              setState((s) => ({ ...s, status: "archived" }));
              toast.info("Archived.");
            }}
            onDuplicate={() => {
              toast.info("Duplicated as draft. (wireframe: no persistence)");
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_360px]">
        {/* Left — Tabs */}
        <div className="min-w-0 space-y-4">
          <Tabs defaultValue="copy">
            <TabsList>
              <TabsTrigger value="copy">Copy</TabsTrigger>
              <TabsTrigger value="destination">Destination</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="copy">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Copy variants</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Meta&apos;s Advantage+ rotates headlines, primary text, and
                    descriptions across impressions. More variants usually lift
                    CTR on fresh audiences.
                  </p>
                </CardHeader>
                <CardContent>
                  <CreativeCopyEditor value={copy} onChange={setCopy} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="destination">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Traffic destination</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Where a click on this ad goes. The call-to-action button must
                    match — e.g. click-to-call requires <code>CALL_NOW</code>.
                  </p>
                </CardHeader>
                <CardContent>
                  <DestinationEditor
                    value={destination}
                    onChange={setDestination}
                    clientWebsiteUrl={client.websiteUrl}
                    clientPhone={
                      client.ctaPhoneNumber ?? client.primaryContact.phone
                    }
                    clientLeadForms={leadForms}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish">
              <PublishTab
                config={publish}
                onChange={setPublish}
                attachedCampaigns={attachedCampaigns}
              />
            </TabsContent>

            <TabsContent value="performance">
              <PerformanceTab creative={creative} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right — Sticky Meta preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <MetaPreview creative={previewCreative} />
        </div>
      </div>
    </>
  );
}

function ActionCluster({
  status,
  approvalState,
  metaConnected,
  clientId,
  onApproveAgency,
  onReject,
  onLaunch,
  onPause,
  onResume,
  onArchive,
  onDuplicate,
}: {
  status: Creative["status"];
  approvalState: Creative["approvalState"];
  metaConnected: boolean;
  clientId: string;
  onApproveAgency: () => void;
  onReject: () => void;
  onLaunch: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
}) {
  if (approvalState === "awaiting_agency") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onReject}>
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
        <Button size="sm" onClick={onApproveAgency}>
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
      </div>
    );
  }
  if (approvalState === "awaiting_client") {
    return (
      <Button size="sm" variant="outline" disabled>
        <Check className="h-3.5 w-3.5" /> Awaiting client sign-off
      </Button>
    );
  }
  if (approvalState === "rejected") {
    return (
      <Button size="sm" onClick={onDuplicate}>
        <Copy className="h-3.5 w-3.5" /> Duplicate & edit
      </Button>
    );
  }
  // approved or not_required
  if (status === "draft" || status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        {metaConnected ? (
          <Button size="sm" onClick={onLaunch}>
            <Rocket className="h-3.5 w-3.5" /> Launch
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild title="Connect Meta first">
            <Link href={`/clients/${clientId}/connections`}>
              <Rocket className="h-3.5 w-3.5" /> Connect to launch
            </Link>
          </Button>
        )}
      </div>
    );
  }
  if (status === "live") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onPause}>
          <Pause className="h-3.5 w-3.5" /> Pause
        </Button>
      </div>
    );
  }
  if (status === "paused") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onArchive}>
          <Archive className="h-3.5 w-3.5" /> Archive
        </Button>
        <Button size="sm" onClick={onResume}>
          <Play className="h-3.5 w-3.5" /> Resume
        </Button>
      </div>
    );
  }
  // archived
  return (
    <Button size="sm" variant="outline" onClick={onDuplicate}>
      <RefreshCw className="h-3.5 w-3.5" /> Duplicate
    </Button>
  );
}

function PublishTab({
  config,
  onChange,
  attachedCampaigns,
}: {
  config: MetaPublishConfig;
  onChange: (next: MetaPublishConfig) => void;
  attachedCampaigns: Array<{ id: string; name: string; status: string; platform: string }>;
}) {
  const update = (patch: Partial<MetaPublishConfig>) => onChange({ ...config, ...patch });
  const updateAdv = (patch: Partial<MetaPublishConfig["advantagePlus"]>) =>
    onChange({ ...config, advantagePlus: { ...config.advantagePlus, ...patch } });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Meta publish settings</CardTitle>
          <p className="text-xs text-muted-foreground">
            These flags are sent with the ad when it&apos;s published via the
            Graph API. Changes apply on next launch.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Placements</Label>
            <Select
              value={config.placements}
              onValueChange={(v: string | null) => {
                if (v) update({ placements: v as MetaPublishConfig["placements"] });
              }}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed (1:1 creatives)</SelectItem>
                <SelectItem value="stories_reels">Stories & Reels (9:16)</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Creative format must match the placement — 1:1 feeds don&apos;t
              render well on 9:16 Stories.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Dynamic creative (asset_feed_spec)</div>
              <p className="text-xs text-muted-foreground">
                When on, all headline/body/description variants are rotated
                automatically by Meta. When off, a single variant ships.
              </p>
            </div>
            <SwitchRow
              label="Use dynamic creative"
              checked={config.useDynamicCreative}
              onCheckedChange={(v: boolean) => update({ useDynamicCreative: v })}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Advantage+ creative</div>
              <p className="text-xs text-muted-foreground">
                Meta applies AI enhancements at delivery time.
              </p>
            </div>
            <SwitchRow
              label="Standard enhancements"
              description="Minor visual tweaks: crop, brightness, contrast."
              checked={config.advantagePlus.standardEnhancements}
              onCheckedChange={(v: boolean) => updateAdv({ standardEnhancements: v })}
            />
            <SwitchRow
              label="Text generation"
              description="Meta may insert AI-generated additional copy variants."
              checked={config.advantagePlus.textGeneration}
              onCheckedChange={(v: boolean) => updateAdv({ textGeneration: v })}
            />
            <SwitchRow
              label="Text optimizations"
              description="A/B tests text placement across headline / primary / description slots."
              checked={config.advantagePlus.textOptimizations}
              onCheckedChange={(v: boolean) => updateAdv({ textOptimizations: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Attached campaigns</CardTitle>
          <p className="text-xs text-muted-foreground">
            This creative is currently attached to the following campaigns.
            Launch from here adds it to another campaign.
          </p>
        </CardHeader>
        <CardContent>
          {attachedCampaigns.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              Not yet attached to any campaign. Use <b>Launch</b> above to attach
              to a campaign and publish to Meta.
            </div>
          ) : (
            <ul className="space-y-2">
              {attachedCampaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-2.5"
                >
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {c.platform} · {c.status}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/campaigns/${c.id}`}>Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-md py-1.5">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{label}</div>
        {description ? (
          <div className="text-xs text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function PerformanceTab({ creative }: { creative: Creative }) {
  if (!creative.performance) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No performance data yet — this creative has not gone live.
        </CardContent>
      </Card>
    );
  }
  const p = creative.performance;

  // Synthesize a 7-point trend for the sparkline
  const seed = [...creative.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const trend = Array.from({ length: 7 }, (_, i) => {
    const jitter = ((seed * (i + 3)) % 17) / 17;
    return Math.max(1, p.spend / 7 + (jitter - 0.5) * (p.spend / 5));
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MetricCard label="Impressions" value={num(p.impressions)} />
        <MetricCard label="Clicks" value={num(p.clicks)} />
        <MetricCard label="CTR" value={pct(p.ctr)} />
        <MetricCard label="Leads" value={num(p.leads)} />
        <MetricCard label="Spend" value={gbp(p.spend)} />
        <MetricCard
          label="CPL"
          value={p.leads > 0 ? gbp(p.cpl, true) : "—"}
          delta={-4.2}
          invertGood
        />
        <MetricCard label="CPM" value={gbp(p.cpm, true)} />
        <MetricCard label="Frequency" value={p.frequency.toFixed(2)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Spend · last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkline data={trend} height={80} />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
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
    <div className="rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        {delta !== undefined ? (
          <MetricDelta value={delta} invertGood={invertGood} />
        ) : null}
      </div>
    </div>
  );
}
