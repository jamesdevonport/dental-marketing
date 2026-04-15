"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreativeThumbnail } from "./thumbnail";
import { DestinationEditor } from "./destination-editor";
import {
  clientById,
  clients,
  leadFormsByClient,
  personaById,
  personas,
  templates,
  topicById,
  topics,
  type CreativeDestination,
  type Format,
  type TemplateId,
  type Persona,
  type Topic,
  type Creative,
  type Client,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";

type Phase = "configure" | "generating" | "complete";

const FORMAT_UNSUPPORTED: Record<TemplateId, Format[]> = {
  "event-promo": [],
  testimonial: [],
  community: ["link"],
  comparison: ["story"],
  "apple-notes": ["link"],
  imessage: ["link"],
};

export function MatrixGenerator({
  open,
  onOpenChange,
  initialClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}) {
  const [clientId, setClientId] = useState<string>(
    initialClientId ?? clients[0].id,
  );
  const client = clientById[clientId];

  // Re-seed selections when the client changes or sheet opens fresh.
  useEffect(() => {
    if (!open) return;
    if (initialClientId && initialClientId !== clientId) {
      setClientId(initialClientId);
    }
  }, [open, initialClientId, clientId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-[720px] gap-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Generate creatives
          </SheetTitle>
          <SheetDescription>
            Pick the matrix axes. We&apos;ll generate on-brand creatives for each
            combination and route them through the client&apos;s approval flow.
          </SheetDescription>
        </SheetHeader>

        <MatrixBody
          client={client}
          onSwitchClient={setClientId}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function MatrixBody({
  client,
  onSwitchClient,
  onClose,
}: {
  client: Client;
  onSwitchClient: (id: string) => void;
  onClose: () => void;
}) {
  // State ----------------------------------------------------------------
  const [selectedTemplates, setSelectedTemplates] = useState<Set<TemplateId>>(
    new Set(["event-promo", "testimonial"]),
  );
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(client.topicIds.slice(0, 3)),
  );
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(
    new Set(client.personaIds.slice(0, 2)),
  );
  const [selectedFormats, setSelectedFormats] = useState<Set<Format>>(
    new Set(["feed", "story"]),
  );
  const [variantCount, setVariantCount] = useState<number>(2);
  const [aiImagery, setAiImagery] = useState<boolean>(false);
  const [destination, setDestination] = useState<CreativeDestination>(
    defaultDestinationFor(client),
  );

  // Reset picks when client changes
  useEffect(() => {
    setSelectedTopics(new Set(client.topicIds.slice(0, 3)));
    setSelectedPersonas(new Set(client.personaIds.slice(0, 2)));
    setDestination(defaultDestinationFor(client));
  }, [client]);

  // Phase state
  const [phase, setPhase] = useState<Phase>("configure");
  const [progress, setProgress] = useState(0);

  const totalCombos = useMemo(() => {
    let n = 0;
    for (const t of selectedTemplates) {
      const validFormats = [...selectedFormats].filter(
        (f) => !FORMAT_UNSUPPORTED[t].includes(f),
      );
      n += selectedTopics.size * selectedPersonas.size * validFormats.length;
    }
    return n;
  }, [selectedTemplates, selectedTopics, selectedPersonas, selectedFormats]);

  const geminiCredits = aiImagery ? totalCombos : 0;
  const canGenerate =
    totalCombos > 0 && totalCombos <= 200 && phase === "configure";

  const startGenerate = () => {
    setPhase("generating");
    setProgress(0);
    const durationMs = Math.min(6000, 200 + totalCombos * 60);
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setPhase("complete");
      }
    };
    requestAnimationFrame(tick);
  };

  // ---- Render -----------------------------------------------------------

  if (phase === "generating") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-10">
        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        <div className="space-y-2 text-center">
          <h3 className="text-base font-semibold">
            Generating {totalCombos} creatives for {client.name}…
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Rendering templates, synthesising copy variants, and preparing
            thumbnails. This normally takes under a minute.
          </p>
        </div>
        <Progress value={progress} className="w-64" />
        <div className="text-xs tabular-nums text-muted-foreground">
          {Math.round(progress)}% · {Math.round((progress / 100) * totalCombos)} /{" "}
          {totalCombos}
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    const approvalMsg =
      client.approvalMode === "auto"
        ? `They're already approved and ready to launch.`
        : client.approvalMode === "approve_everything"
          ? client.clientApprovalRequired
            ? `They've been routed to the agent inbox for your review, then ${client.name} for final sign-off.`
            : `They've been routed to the agent inbox for your review.`
          : `They're saved as drafts (this client is report-only).`;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <Check className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-semibold">
            Generated {totalCombos} creatives
          </h3>
          <p className="text-sm text-muted-foreground">{approvalMsg}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild onClick={onClose}>
            <Link href={`/clients/${client.id}/creatives`}>
              View in Ad Directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Client picker */}
        <section className="space-y-2">
          <Label htmlFor="matrix-client">Client</Label>
          <Select
            value={client.id}
            onValueChange={(v: string | null) => {
              if (v) onSwitchClient(v);
            }}
          >
            <SelectTrigger id="matrix-client" className="w-full sm:w-[320px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Templates */}
        <AxisPicker
          label="Templates"
          options={templates.map((t) => ({ value: t.id, label: t.name }))}
          selected={selectedTemplates}
          onChange={setSelectedTemplates as (s: Set<string>) => void}
        />

        {/* Topics (filtered to client's active) */}
        <AxisPicker
          label="Topics"
          description={`Scoped to ${client.name}'s active topics.`}
          options={client.topicIds.map((id) => {
            const t = topicById[id] as Topic;
            return { value: id, label: t.name };
          })}
          selected={selectedTopics}
          onChange={setSelectedTopics}
        />

        {/* Personas */}
        <AxisPicker
          label="Personas"
          description={`Scoped to ${client.name}'s active personas.`}
          options={client.personaIds.map((id) => {
            const p = personaById[id] as Persona;
            return { value: id, label: p.name };
          })}
          selected={selectedPersonas}
          onChange={setSelectedPersonas}
        />

        {/* Formats */}
        <AxisPicker
          label="Formats"
          options={[
            { value: "feed", label: "Feed (1:1)" },
            { value: "story", label: "Stories & Reels (9:16)" },
            { value: "link", label: "Link (1.91:1)" },
          ]}
          selected={selectedFormats as Set<string>}
          onChange={setSelectedFormats as (s: Set<string>) => void}
        />

        {/* Copy variants */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Copy variants per creative</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {variantCount}
            </span>
          </div>
          <Slider
            min={1}
            max={3}
            step={1}
            value={[variantCount]}
            onValueChange={(v: number | readonly number[]) => {
              const first = Array.isArray(v) ? v[0] : v;
              setVariantCount(typeof first === "number" ? first : 2);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Meta&apos;s Advantage+ rotates copy variants for you — more variants
            usually lift CTR on fresh audiences.
          </p>
        </section>

        {/* AI imagery */}
        <section>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={aiImagery}
              onCheckedChange={(v: boolean) => setAiImagery(Boolean(v))}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Generate background imagery with Gemini
              </div>
              <div className="text-xs text-muted-foreground">
                Uses 1 Gemini credit per creative. Off = use template layouts only.
              </div>
            </div>
          </label>
        </section>

        {/* Default destination */}
        <section className="space-y-2">
          <div>
            <Label>Default destination</Label>
            <p className="text-xs text-muted-foreground">
              Applied to all generated creatives. Edit per-creative later if needed.
            </p>
          </div>
          <DestinationEditor
            value={destination}
            clientWebsiteUrl={client.websiteUrl}
            clientPhone={client.ctaPhoneNumber ?? client.primaryContact.phone}
            clientLeadForms={leadFormsByClient[client.id] ?? []}
            onChange={setDestination}
          />
        </section>
      </div>

      <SheetFooter className="border-t px-6 py-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-sm tabular-nums">
              <span className="font-semibold text-foreground">
                {totalCombos}
              </span>{" "}
              creatives
              {variantCount > 1
                ? ` · ${variantCount} copy variants each`
                : ""}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {selectedTemplates.size} × {selectedTopics.size} ×{" "}
              {selectedPersonas.size} ×{" "}
              {[...selectedFormats].filter((f) =>
                [...selectedTemplates].some(
                  (t) => !FORMAT_UNSUPPORTED[t].includes(f),
                ),
              ).length}{" "}
              format(s)
              {geminiCredits > 0 ? ` · ${geminiCredits} Gemini credits` : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={startGenerate}
              disabled={!canGenerate}
              title={
                totalCombos > 200
                  ? "Too many creatives — narrow the axes (max 200 per run)"
                  : totalCombos === 0
                    ? "Select at least one option in each axis"
                    : undefined
              }
            >
              Generate {totalCombos > 0 ? totalCombos : ""}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  );
}

function AxisPicker({
  label,
  description,
  options,
  selected,
  onChange,
}: {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  return (
    <section className="space-y-2">
      <div>
        <Label>{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.has(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "bg-card hover:bg-muted",
              )}
            >
              {active ? <Check className="h-3.5 w-3.5" /> : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function defaultDestinationFor(client: Client): CreativeDestination {
  const forms = leadFormsByClient[client.id] ?? [];
  const firstForm = forms.find((f) => f.status === "published") ?? forms[0];
  if (firstForm && client.defaultLeadFormId === firstForm.id) {
    return { type: "lead_form", leadFormId: firstForm.id, leadFormName: firstForm.name };
  }
  return {
    type: "website",
    url: `${client.websiteUrl}/book-online`,
    displayUrl: client.websiteUrl.replace(/^https?:\/\//, ""),
    utm: {
      source: "meta",
      medium: "paid_social",
      campaign: "",
      content: "",
    },
    pixelEventId: "Lead",
  };
}
