"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Target, Trash2, TrendingUp, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardShell, type WizardStep } from "@/components/common/wizard-shell";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import { MatrixGenerator } from "@/components/creative/matrix-generator";
import { cn } from "@/lib/utils";
import {
  clientById,
  clients,
  creativesByClient,
  type Creative,
  type Format,
} from "@/lib/fixtures";
import { gbp, num } from "@/lib/format";

type Objective = "leads" | "conversions" | "traffic" | "awareness";
type Placements = "feed" | "stories_reels" | "both";
type Audience = "advantage_plus" | "custom" | "lookalike" | "retargeting";

type AdSetDraft = {
  id: string;
  name: string;
  dailyBudget: number;
  placements: Placements;
  audience: Audience;
  ageMin: number;
  ageMax: number;
};

const OBJECTIVES: { value: Objective; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "leads", label: "Lead generation", description: "Instant Forms or website form fills. Most common for dental enquiries.", icon: Users },
  { value: "conversions", label: "Conversions", description: "Website conversions via Meta Pixel (e.g. appointment bookings). Requires pixel firing.", icon: Target },
  { value: "traffic", label: "Traffic", description: "Send clicks to your website. Lower intent than leads.", icon: TrendingUp },
  { value: "awareness", label: "Awareness", description: "Maximise reach and impressions. Useful for new practice launches.", icon: Zap },
];

export function CampaignWizard({ initialClientId }: { initialClientId?: string }) {
  const router = useRouter();

  // Step 1: Objective
  const [objective, setObjective] = useState<Objective>("leads");

  // Step 2: Client + Name + Budget
  const [clientId, setClientId] = useState<string>(initialClientId ?? clients[0].id);
  const client = clientById[clientId];
  const [name, setName] = useState(`${client.name} — Invisalign — Q2`);
  const [cbo, setCbo] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(60);
  const [bidStrategy, setBidStrategy] = useState<string>("lowest_cost");

  // Step 3: Ad sets
  const [adSets, setAdSets] = useState<AdSetDraft[]>([
    {
      id: "as-1",
      name: "Feed · 22-45",
      dailyBudget: 30,
      placements: "feed",
      audience: "advantage_plus",
      ageMin: 22,
      ageMax: 45,
    },
  ]);

  // Step 4: Creatives
  const [selectedCreativeIds, setSelectedCreativeIds] = useState<Set<string>>(new Set());
  const [matrixOpen, setMatrixOpen] = useState(false);

  // Step 5: Tracking
  const [pixelEvent, setPixelEvent] = useState<string>("Lead");
  const [utmCampaign, setUtmCampaign] = useState("invisalign-q2");

  const availableCreatives: Creative[] = (creativesByClient[clientId] ?? []).filter(
    (c) => c.approvalState === "approved" || c.approvalState === "not_required",
  );

  const toggleCreative = (id: string) => {
    const next = new Set(selectedCreativeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCreativeIds(next);
  };

  // Placement mismatch warnings
  const placementWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const adSet of adSets) {
      const formatsNeeded: Format[] =
        adSet.placements === "feed" ? ["feed"] :
        adSet.placements === "stories_reels" ? ["story"] :
        ["feed", "story"];
      const attached = availableCreatives.filter((c) => selectedCreativeIds.has(c.id));
      for (const c of attached) {
        if (!formatsNeeded.includes(c.format) && c.format !== "link") {
          warnings.push(
            `"${c.copy.headlines[0].slice(0, 32)}…" is ${c.format} but ${adSet.name} runs ${adSet.placements.replace("_", " + ")}`,
          );
        }
      }
    }
    return warnings.slice(0, 3);
  }, [adSets, availableCreatives, selectedCreativeIds]);

  const steps: WizardStep[] = [
    {
      id: "objective",
      label: "Objective",
      description: "What should this campaign do?",
      render: () => (
        <div className="space-y-5">
          <StepHeader title="What are we trying to achieve?" description="This drives bid optimisation. Pick the outcome that matters most." />
          <div className="grid gap-2 sm:grid-cols-2">
            {OBJECTIVES.map((o) => {
              const active = objective === o.value;
              const Icon = o.icon;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setObjective(o.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-md border bg-card p-4 text-left transition-colors hover:bg-muted/30",
                    active && "border-primary bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-md",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{o.label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{o.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "name-budget",
      label: "Name & budget",
      description: "Pacing and strategy",
      canAdvance: name.trim().length > 0,
      render: () => (
        <div className="space-y-5">
          <StepHeader title="Name the campaign and set the budget" description="We recommend the pattern [Practice] — [Topic] — [Month]. Budget applies to the whole campaign or per ad set." />
          {!initialClientId ? (
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={(v: string | null) => { if (v) setClientId(v); }}>
                <SelectTrigger className="w-full sm:w-[360px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="cmp-name">Campaign name</Label>
            <Input id="cmp-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Budget strategy</CardTitle>
              <p className="text-xs text-muted-foreground">
                Campaign Budget Optimization (CBO) lets Meta move spend between
                ad sets automatically. Turn off to set per-ad-set budgets.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Campaign-level budget (CBO)</div>
                  <div className="text-xs text-muted-foreground">Recommended — Meta optimises spend across ad sets.</div>
                </div>
                <Switch checked={cbo} onCheckedChange={(v: boolean) => setCbo(v)} />
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Daily budget</Label>
                  <span className="text-lg font-semibold tabular-nums">{gbp(dailyBudget)}/day</span>
                </div>
                <Slider
                  min={5}
                  max={500}
                  step={5}
                  value={[dailyBudget]}
                  onValueChange={(v: number | readonly number[]) => {
                    const first = Array.isArray(v) ? v[0] : v;
                    if (typeof first === "number") setDailyBudget(first);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bid strategy</Label>
                <Select value={bidStrategy} onValueChange={(v: string | null) => { if (v) setBidStrategy(v); }}>
                  <SelectTrigger className="w-full sm:w-[360px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowest_cost">Lowest cost (recommended)</SelectItem>
                    <SelectItem value="cost_cap">Cost cap</SelectItem>
                    <SelectItem value="bid_cap">Bid cap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "adsets",
      label: "Ad sets",
      description: "Audience + placements",
      badge: String(adSets.length),
      canAdvance: adSets.length > 0 && adSets.every((a) => a.name.trim().length > 0),
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Define the audiences and placements"
            description="Each ad set runs in one placement slot (Feed, Stories/Reels, or Both) with one audience configuration."
          />
          <div className="space-y-3">
            {adSets.map((adSet, idx) => (
              <Card key={adSet.id}>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label>Ad set name</Label>
                      <Input
                        value={adSet.name}
                        onChange={(e) =>
                          setAdSets((cur) =>
                            cur.map((a) => (a.id === adSet.id ? { ...a, name: e.target.value } : a)),
                          )
                        }
                      />
                    </div>
                    {adSets.length > 1 ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setAdSets((cur) => cur.filter((a) => a.id !== adSet.id))
                        }
                        aria-label="Remove ad set"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Placement</Label>
                      <Select
                        value={adSet.placements}
                        onValueChange={(v: string | null) => {
                          if (!v) return;
                          setAdSets((cur) =>
                            cur.map((a) => (a.id === adSet.id ? { ...a, placements: v as Placements } : a)),
                          );
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feed">Feed (1:1)</SelectItem>
                          <SelectItem value="stories_reels">Stories & Reels (9:16)</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Audience</Label>
                      <Select
                        value={adSet.audience}
                        onValueChange={(v: string | null) => {
                          if (!v) return;
                          setAdSets((cur) =>
                            cur.map((a) => (a.id === adSet.id ? { ...a, audience: v as Audience } : a)),
                          );
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advantage_plus">Advantage+ (recommended)</SelectItem>
                          <SelectItem value="custom">Custom targeting</SelectItem>
                          <SelectItem value="lookalike">Lookalike</SelectItem>
                          <SelectItem value="retargeting">Retargeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Age range</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <Input
                          type="number"
                          value={adSet.ageMin}
                          onChange={(e) =>
                            setAdSets((cur) =>
                              cur.map((a) => (a.id === adSet.id ? { ...a, ageMin: Number(e.target.value) } : a)),
                            )
                          }
                          className="h-9 w-20"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="number"
                          value={adSet.ageMax}
                          onChange={(e) =>
                            setAdSets((cur) =>
                              cur.map((a) => (a.id === adSet.id ? { ...a, ageMax: Number(e.target.value) } : a)),
                            )
                          }
                          className="h-9 w-20"
                        />
                      </div>
                      {adSet.audience === "advantage_plus" && adSet.ageMax < 65 ? (
                        <p className="text-[11px] text-warning-foreground">
                          Advantage+ audience requires max age ≥ 65. Meta will reject this ad set as-is.
                        </p>
                      ) : null}
                    </div>
                    {!cbo ? (
                      <div className="space-y-1.5">
                        <Label>Daily budget</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={adSet.dailyBudget}
                            onChange={(e) =>
                              setAdSets((cur) =>
                                cur.map((a) => (a.id === adSet.id ? { ...a, dailyBudget: Number(e.target.value) } : a)),
                              )
                            }
                            className="h-9 w-28"
                          />
                          <span className="text-sm text-muted-foreground">/ day</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAdSets((cur) => [
                  ...cur,
                  {
                    id: `as-${cur.length + 1}`,
                    name: `Ad set ${cur.length + 1}`,
                    dailyBudget: 30,
                    placements: "feed",
                    audience: "advantage_plus",
                    ageMin: 22,
                    ageMax: 65,
                  },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add ad set
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "creatives",
      label: "Creatives",
      description: "Pick or generate",
      badge: selectedCreativeIds.size ? String(selectedCreativeIds.size) : undefined,
      canAdvance: selectedCreativeIds.size > 0,
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Pick creatives to run"
            description="Select approved creatives from the Ad Directory, or generate fresh ones from the matrix."
          />
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{availableCreatives.length}</span> approved creatives available
              {selectedCreativeIds.size > 0 ? (
                <> · <span className="font-medium text-foreground">{selectedCreativeIds.size}</span> selected</>
              ) : null}
            </div>
            <Button size="sm" variant="outline" onClick={() => setMatrixOpen(true)}>
              <Sparkles className="h-3.5 w-3.5" /> Generate new
            </Button>
          </div>

          {placementWarnings.length > 0 ? (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="pt-4 text-xs space-y-1">
                <div className="font-medium text-warning-foreground">Placement format mismatch</div>
                <ul className="space-y-0.5 text-muted-foreground">
                  {placementWarnings.map((w, i) => (<li key={i}>• {w}</li>))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {availableCreatives.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No approved creatives for {client.name} yet.{" "}
                <button type="button" onClick={() => setMatrixOpen(true)} className="underline underline-offset-2 hover:text-foreground">
                  Generate a batch
                </button>{" "}
                to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableCreatives.map((c) => {
                const selected = selectedCreativeIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCreative(c.id)}
                    className={cn(
                      "group relative rounded-lg border bg-card p-2 text-left transition-colors",
                      selected ? "ring-2 ring-primary border-primary" : "hover:bg-muted/30",
                    )}
                  >
                    {selected ? (
                      <div className="absolute right-2 top-2 z-10 grid h-5 w-5 place-items-center rounded bg-primary text-primary-foreground">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    ) : null}
                    <CreativeThumbnail creative={c} size="md" className="w-full max-w-none" />
                    <div className="mt-1.5 line-clamp-2 text-[11px] font-medium">
                      {c.copy.headlines[0]}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                      {c.format} · {c.templateId.replace("-", " ")}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <MatrixGenerator open={matrixOpen} onOpenChange={setMatrixOpen} initialClientId={clientId} />
        </div>
      ),
    },
    {
      id: "tracking",
      label: "Tracking",
      description: "Conversion + UTM",
      render: () => (
        <div className="space-y-5">
          <StepHeader title="Conversion tracking" description="Pick the pixel event the agent optimises for, and set campaign-level UTM defaults." />
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Meta Pixel event</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Select value={pixelEvent} onValueChange={(v: string | null) => { if (v) setPixelEvent(v); }}>
                <SelectTrigger className="w-full sm:w-[320px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Schedule">Schedule</SelectItem>
                  <SelectItem value="Contact">Contact</SelectItem>
                  <SelectItem value="CompleteRegistration">CompleteRegistration</SelectItem>
                  <SelectItem value="ViewContent">ViewContent</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {objective === "leads"
                  ? "For Lead generation campaigns, Meta uses the Lead event to optimise delivery."
                  : "Optional — used as a secondary signal when optimising for this objective."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">UTM parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">utm_source</Label>
                  <Input defaultValue="meta" className="h-8 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">utm_medium</Label>
                  <Input defaultValue="paid_social" className="h-8 font-mono text-xs" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">utm_campaign</Label>
                  <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="h-8 font-mono text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "review",
      label: "Review & launch",
      description: "Last look",
      render: () => {
        const estReach = 18000 + selectedCreativeIds.size * 1200;
        const estDaily = estReach * 0.025;
        return (
          <div className="space-y-5">
            <StepHeader title="Ready to launch?" description="We'll publish to Meta on confirm. You can always pause from the campaign detail page." />
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Summary</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                <SummaryRow label="Client" value={client.name} />
                <SummaryRow label="Name" value={name} />
                <SummaryRow label="Objective" value={OBJECTIVES.find((o) => o.value === objective)?.label ?? objective} />
                <SummaryRow label="Budget strategy" value={cbo ? "Campaign (CBO)" : "Per ad set"} />
                <SummaryRow label="Daily budget" value={`${gbp(dailyBudget)}/day`} />
                <SummaryRow label="Bid strategy" value={bidStrategy.replace("_", " ")} />
                <SummaryRow label="Ad sets" value={String(adSets.length)} />
                <SummaryRow label="Creatives selected" value={String(selectedCreativeIds.size)} />
                <SummaryRow label="Pixel event" value={pixelEvent} />
                <SummaryRow label="UTM campaign" value={utmCampaign} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Estimated reach (7 days)</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Stat label="Estimated reach" value={num(Math.round(estReach))} />
                <Stat label="Est. daily impressions" value={num(Math.round(estDaily))} />
                <Stat label="Est. weekly leads" value={num(Math.round(estDaily * 0.03 * 7))} />
              </CardContent>
            </Card>
          </div>
        );
      },
    },
  ];

  const finish = () => {
    toast.success("Launching campaign to Meta…", { duration: 1200 });
    setTimeout(() => {
      toast.success(`${name} is live.`);
      router.push(`/clients/${clientId}/campaigns`);
    }, 1200);
  };

  const saveDraft = () => toast.info("Draft saved.");

  return (
    <WizardShell
      title="New campaign"
      description="6 steps — we'll push to Meta on launch."
      steps={steps}
      onFinish={finish}
      onSaveDraft={saveDraft}
      finishLabel="Launch campaign"
    />
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium truncate max-w-[50%] text-right">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
