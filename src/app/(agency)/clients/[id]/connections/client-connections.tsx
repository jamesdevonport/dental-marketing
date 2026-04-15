"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Plug,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Client, ConnectionStatus } from "@/lib/fixtures";

type Service = {
  key: string;
  label: string;
  description: string;
  required: boolean;
  scopeHints?: string[];
};

const META_SERVICES: Service[] = [
  {
    key: "meta_business",
    label: "Meta Business Manager",
    description: "Required for all Meta ads. Grants access to ad account, business assets, and billing.",
    required: true,
    scopeHints: ["ads_management", "ads_read", "business_management"],
  },
  {
    key: "meta_page",
    label: "Meta Page",
    description: "The Facebook Page ads run from. Required for any Meta ad campaign.",
    required: true,
    scopeHints: ["pages_read_engagement", "pages_manage_ads"],
  },
  {
    key: "meta_instagram",
    label: "Instagram account",
    description: "Optional. Only required if you want to show ads on Instagram placements (Feed, Stories, Reels).",
    required: false,
  },
  {
    key: "meta_pixel",
    label: "Meta Pixel + CAPI",
    description: "Tracks conversions from ad clicks. Needed for CPL optimisation and Lead-based bidding.",
    required: true,
  },
];

const GOOGLE_SERVICES: Service[] = [
  {
    key: "google_ads",
    label: "Google Ads",
    description: "Required for Search / Performance Max campaigns.",
    required: false,
    scopeHints: ["adwords"],
  },
  {
    key: "google_ga4",
    label: "Google Analytics (GA4)",
    description: "Optional. Improves attribution reporting if installed.",
    required: false,
  },
];

export function ClientConnections({ client: initial }: { client: Client }) {
  // Local copy of connection status so the "Connect" simulation feels real.
  const [meta, setMeta] = useState<ConnectionStatus>(initial.connections.meta);
  const [google, setGoogle] = useState<ConnectionStatus>(initial.connections.google);
  const [pixel, setPixel] = useState<ConnectionStatus>(initial.connections.pixel);
  const [busy, setBusy] = useState<string | null>(null);

  const sim = (serviceKey: string, current: ConnectionStatus, set: (s: ConnectionStatus) => void) => {
    setBusy(serviceKey);
    toast.info("Redirecting to OAuth…");
    setTimeout(() => {
      setBusy(null);
      set(current === "connected" ? "missing" : "connected");
      toast.success(
        current === "connected" ? "Disconnected." : "Connected successfully.",
      );
    }, 1200);
  };

  const anyBroken =
    meta !== "connected" || pixel !== "connected" || google === "degraded";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {anyBroken ? (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            One or more connections need attention. Ads can&apos;t launch while a
            required service is missing or degraded.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Meta
          </h2>
          <p className="text-sm text-muted-foreground">
            Facebook + Instagram ads and conversion tracking.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <ServiceCard
            service={META_SERVICES[0]}
            status={meta}
            busy={busy === "meta_business"}
            onToggle={() => sim("meta_business", meta, setMeta)}
          />
          <ServiceCard
            service={META_SERVICES[1]}
            status={meta === "connected" ? "connected" : "missing"}
            busy={busy === "meta_page"}
            onToggle={() => sim("meta_page", meta, setMeta)}
          />
          <ServiceCard
            service={META_SERVICES[2]}
            status={meta === "connected" ? "connected" : "missing"}
            busy={busy === "meta_instagram"}
            onToggle={() => sim("meta_instagram", meta, setMeta)}
          />
          <PixelCard pixel={pixel} setPixel={setPixel} busy={busy === "pixel"} websiteUrl={initial.websiteUrl} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Google
          </h2>
          <p className="text-sm text-muted-foreground">
            Search, Performance Max, and analytics.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <ServiceCard
            service={GOOGLE_SERVICES[0]}
            status={google}
            busy={busy === "google_ads"}
            onToggle={() => sim("google_ads", google, setGoogle)}
          />
          <ServiceCard
            service={GOOGLE_SERVICES[1]}
            status={google}
            busy={busy === "google_ga4"}
            onToggle={() => sim("google_ga4", google, setGoogle)}
          />
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  service,
  status,
  busy,
  onToggle,
}: {
  service: Service;
  status: ConnectionStatus;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {service.label}
            {service.required ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Required
              </span>
            ) : null}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{service.description}</p>
        </div>
        <StatusPill status={status} />
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {service.scopeHints?.length ? (
            <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
              {service.scopeHints.map((s) => (
                <code
                  key={s}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono"
                >
                  {s}
                </code>
              ))}
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          variant={status === "connected" ? "outline" : "default"}
          disabled={busy}
          onClick={onToggle}
        >
          {busy ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Connecting…
            </>
          ) : status === "connected" ? (
            <>
              <Unplug className="h-3.5 w-3.5" /> Disconnect
            </>
          ) : status === "degraded" ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" /> Reconnect
            </>
          ) : (
            <>
              <Plug className="h-3.5 w-3.5" /> Connect
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function PixelCard({
  pixel,
  setPixel,
  busy,
  websiteUrl,
}: {
  pixel: ConnectionStatus;
  setPixel: (s: ConnectionStatus) => void;
  busy: boolean;
  websiteUrl: string;
}) {
  const snippet = `<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s){/* ... */}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '123456789012345');
fbq('track', 'PageView');
</script>`;

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    toast.success("Snippet copied to clipboard");
  };

  const sendEmail = () => {
    toast.success(`Email sent to the webmaster for ${websiteUrl}`);
  };

  const test = () => {
    toast.info("Firing test PageView event…");
    setTimeout(() => {
      setPixel("connected");
      toast.success("Pixel test successful. Status: connected.");
    }, 1500);
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            Meta Pixel + CAPI
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Required
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Add this to every page of {websiteUrl}. Needed for Lead optimisation
            and cost-per-lead accuracy.
          </p>
        </div>
        <StatusPill status={pixel} />
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md bg-muted/60 p-3 text-[11px] leading-relaxed font-mono">
          {snippet}
        </pre>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy className="h-3.5 w-3.5" /> Copy snippet
          </Button>
          <Button size="sm" variant="outline" onClick={sendEmail}>
            <Mail className="h-3.5 w-3.5" /> Email to webmaster
          </Button>
          <Button size="sm" onClick={test} disabled={busy}>
            {busy ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Testing…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Test event
              </>
            )}
          </Button>
          <a
            href="https://business.facebook.com/events_manager2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" /> Open Events Manager
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { label: string; className: string }> = {
    connected: {
      label: "Connected",
      className: "bg-success/15 text-success border-success/30",
    },
    degraded: {
      label: "Degraded",
      className: "bg-warning/20 text-warning-foreground border-warning/40",
    },
    missing: {
      label: "Not connected",
      className: "bg-muted text-muted-foreground border-border",
    },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-medium",
        s.className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "connected"
            ? "bg-success"
            : status === "degraded"
              ? "bg-warning"
              : "bg-muted-foreground/40",
        )}
      />
      {s.label}
    </span>
  );
}
