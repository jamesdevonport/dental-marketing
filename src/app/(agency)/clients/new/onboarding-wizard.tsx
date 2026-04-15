"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Plug,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandPreviewCard } from "@/components/common/brand-preview-card";
import { WizardShell, type WizardStep } from "@/components/common/wizard-shell";
import { cn } from "@/lib/utils";
import {
  personas,
  topics,
  type ApprovalMode,
  type BrandKit,
  type Tone,
} from "@/lib/fixtures";
import { gbp } from "@/lib/format";

const DEFAULT_BRAND: BrandKit = {
  primary: "#1E3A8A",
  secondary: "#64748B",
  accent: "#E0F2FE",
  background: "#F8FAFC",
  text: "#0F172A",
  fontPrimary: "Inter",
  fontSecondary: "Inter",
  tone: "warm",
};

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "warm", label: "Warm & reassuring" },
  { value: "premium", label: "Premium & considered" },
  { value: "clinical", label: "Clinical & trustworthy" },
  { value: "fun", label: "Fun & modern" },
];

type Connection = "missing" | "connected" | "degraded";

export function OnboardingWizard() {
  const router = useRouter();

  // Step 1 — Practice basics
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Step 2 — Brand
  const [brand, setBrand] = useState<BrandKit>(DEFAULT_BRAND);

  // Step 3 — Connections
  const [metaConn, setMetaConn] = useState<Connection>("missing");
  const [googleConn, setGoogleConn] = useState<Connection>("missing");
  const [pixelConn, setPixelConn] = useState<Connection>("missing");

  // Step 4 — Topics
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set());

  // Step 5 — Personas
  const [activePersonas, setActivePersonas] = useState<Set<string>>(new Set());

  // Step 6 — Budget & goals
  const [monthlyBudget, setMonthlyBudget] = useState(2400);
  const [primaryGoal, setPrimaryGoal] = useState<string>("leads");

  // Step 7 — Approval mode
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("approve_everything");
  const [clientApproval, setClientApproval] = useState(true);

  const initials = useMemo(() => {
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "DP";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }, [name]);

  // Autofill-from-website simulation
  const autoFill = () => {
    toast.info("Crawling site…");
    setTimeout(() => {
      const suggestedCity = city || "London";
      setCity(suggestedCity);
      setPostcode("W1K 5AA");
      setServiceAreas("W1, SW1, NW1");
      setContactName("Dr. Alex Carter");
      setContactEmail(`hello@${website.replace(/^https?:\/\//, "").replace(/\/$/, "") || "practice.co.uk"}`);
      setContactPhone("+44 20 7555 0000");
      setBrand((b) => ({ ...b, primary: "#14532D", accent: "#BBF7D0", tone: "clinical" }));
      setActiveTopics(new Set(["checkups", "invisalign", "teeth-whitening"]));
      setActivePersonas(new Set(["cost-conscious-family", "busy-parent", "young-professional"]));
      toast.success("Pre-populated from website. Review and refine below.");
    }, 1400);
  };

  const simConnect = (setter: (v: Connection) => void, label: string) => {
    toast.info(`Redirecting to ${label} OAuth…`);
    setTimeout(() => {
      setter("connected");
      toast.success(`${label} connected.`);
    }, 1100);
  };

  const steps: WizardStep[] = [
    {
      id: "basics",
      label: "Practice basics",
      description: "Name, website, location, contact",
      canAdvance: name.trim().length > 0 && website.trim().length > 0,
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Tell us about the practice"
            description="Everything starts here. If you enter the website, we can auto-fill the rest."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Practice name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bright Smile Dental" />
            </Field>
            <Field label="Website" required>
              <div className="flex gap-1.5">
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.co.uk" />
                <Button variant="outline" size="sm" onClick={autoFill} disabled={!website.trim()}>
                  <Wand2 className="h-3.5 w-3.5" /> Auto-fill
                </Button>
              </div>
            </Field>
            <Field label="City">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Brighton" />
            </Field>
            <Field label="Postcode">
              <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="BN1 3FG" />
            </Field>
            <Field label="Service areas" className="sm:col-span-2">
              <Input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder="BN1, BN2, BN3…" />
            </Field>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary contact name">
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
            <Field label="Contact phone" className="sm:col-span-2">
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </Field>
          </div>
        </div>
      ),
    },
    {
      id: "brand",
      label: "Brand kit",
      description: "Logo, palette, fonts, tone",
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="What does the brand look like?"
            description="Pick core colours, fonts, and a tone. The live preview updates as you go."
          />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Palette</CardTitle></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <ColorField label="Primary" value={brand.primary} onChange={(v) => setBrand({ ...brand, primary: v })} />
                  <ColorField label="Secondary" value={brand.secondary} onChange={(v) => setBrand({ ...brand, secondary: v })} />
                  <ColorField label="Accent" value={brand.accent} onChange={(v) => setBrand({ ...brand, accent: v })} />
                  <ColorField label="Background" value={brand.background} onChange={(v) => setBrand({ ...brand, background: v })} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Tone</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {TONE_OPTIONS.map((t) => (
                    <label
                      key={t.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm",
                        brand.tone === t.value ? "border-primary bg-primary/5" : "hover:bg-muted/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={t.value}
                        checked={brand.tone === t.value}
                        onChange={() => setBrand({ ...brand, tone: t.value })}
                        className="h-4 w-4 accent-primary"
                      />
                      {t.label}
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2 lg:sticky lg:top-20 lg:self-start">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live preview
              </div>
              <BrandPreviewCard
                brand={brand}
                logoInitials={initials}
                clientName={name || "Your practice"}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "connections",
      label: "Connections",
      description: "Meta, Google, pixel",
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Connect the ad accounts"
            description="You can skip and come back — but we can't go live until Meta is connected."
          />
          <ConnectionCard
            label="Meta Business Manager"
            description="Required. Grants ad-account + Page access via OAuth."
            status={metaConn}
            onConnect={() => simConnect(setMetaConn, "Meta")}
            required
          />
          <ConnectionCard
            label="Google Ads"
            description="Optional. Enable to run Search or Performance Max alongside Meta."
            status={googleConn}
            onConnect={() => simConnect(setGoogleConn, "Google Ads")}
          />
          <ConnectionCard
            label="Meta Pixel + CAPI"
            description="Required. Install the snippet on the practice website — or email it to their webmaster."
            status={pixelConn}
            onConnect={() => simConnect(setPixelConn, "Pixel")}
            required
            extra={
              <Button size="sm" variant="ghost" onClick={() => toast.success(`Email sent to ${contactEmail || "webmaster"}.`)}>
                <ExternalLink className="h-3.5 w-3.5" /> Email webmaster
              </Button>
            }
          />
        </div>
      ),
    },
    {
      id: "topics",
      label: "Services & topics",
      description: "What they offer",
      badge: activeTopics.size ? String(activeTopics.size) : undefined,
      canAdvance: activeTopics.size > 0,
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Which services do they offer?"
            description="These become the topic axis in the creative matrix. Pick at least one."
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {topics.map((t) => {
              const active = activeTopics.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const next = new Set(activeTopics);
                    if (next.has(t.id)) next.delete(t.id);
                    else next.add(t.id);
                    setActiveTopics(next);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/30",
                    active && "border-primary bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border",
                      active ? "bg-primary border-primary" : "border-border",
                    )}
                  >
                    {active ? <Check className="h-3 w-3 text-primary-foreground" /> : null}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.priceRange}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "personas",
      label: "Audience & personas",
      description: "Who we target",
      badge: activePersonas.size ? String(activePersonas.size) : undefined,
      canAdvance: activePersonas.size > 0,
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Which personas are we targeting?"
            description="Pick any combination. Copy tone adjusts per persona."
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {personas.map((p) => {
              const active = activePersonas.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    const next = new Set(activePersonas);
                    if (next.has(p.id)) next.delete(p.id);
                    else next.add(p.id);
                    setActivePersonas(next);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/30",
                    active && "border-primary bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border",
                      active ? "bg-primary border-primary" : "border-border",
                    )}
                  >
                    {active ? <Check className="h-3 w-3 text-primary-foreground" /> : null}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "budget",
      label: "Budget & goals",
      description: "Spend and primary outcome",
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="What's the spend and the goal?"
            description="We'll pace against this monthly cap. Choose the primary outcome the agent optimises for."
          />
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Monthly budget</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Total monthly cap</Label>
                <span className="text-lg font-semibold tabular-nums">{gbp(monthlyBudget)}</span>
              </div>
              <Slider
                min={500}
                max={10000}
                step={100}
                value={[monthlyBudget]}
                onValueChange={(v: number | readonly number[]) => {
                  const first = Array.isArray(v) ? v[0] : v;
                  if (typeof first === "number") setMonthlyBudget(first);
                }}
              />
              <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <div>Meta: <span className="text-foreground">{gbp(Math.round(monthlyBudget * 0.7))}/mo</span></div>
                <div>Google: <span className="text-foreground">{gbp(Math.round(monthlyBudget * 0.3))}/mo</span></div>
                <div>Daily cap: <span className="text-foreground">{gbp(Math.round(monthlyBudget / 30))}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Primary goal</CardTitle></CardHeader>
            <CardContent>
              <Select value={primaryGoal} onValueChange={(v: string | null) => { if (v) setPrimaryGoal(v); }}>
                <SelectTrigger className="w-full sm:w-[360px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Lead form fills</SelectItem>
                  <SelectItem value="calls">Phone calls</SelectItem>
                  <SelectItem value="appointments">Appointment bookings</SelectItem>
                  <SelectItem value="traffic">Website visits</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Typical CPL benchmark for {primaryGoal === "leads" ? "Lead form fills" : primaryGoal}: <span className="text-foreground">£14–22</span>
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "approval",
      label: "Agent preferences",
      description: "How much the agent can do",
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="How much authority should the agent have?"
            description="You can change this later."
          />
          <div className="space-y-2">
            <ApprovalOption
              value="auto"
              label="Auto-approve routine actions"
              description="Agent publishes new creatives, pauses fatigued ones, and adjusts budgets within guardrails. You're always notified."
              current={approvalMode}
              onSelect={setApprovalMode}
            />
            <ApprovalOption
              value="approve_everything"
              label="Approve everything"
              description="Every new creative and change waits for your nod in the agent inbox."
              current={approvalMode}
              onSelect={setApprovalMode}
            />
            <ApprovalOption
              value="report_only"
              label="Report only"
              description="Agent monitors and reports. Manual launches only. Useful while a new relationship builds trust."
              current={approvalMode}
              onSelect={setApprovalMode}
            />
          </div>
          <Card>
            <CardContent className="flex items-center justify-between gap-3 pt-4">
              <div>
                <div className="text-sm font-medium">Route to client for sign-off</div>
                <div className="text-xs text-muted-foreground">
                  After agency approval, creatives also go to the practice&apos;s
                  portal before they go live.
                </div>
              </div>
              <Switch
                checked={clientApproval && approvalMode !== "report_only"}
                onCheckedChange={(v: boolean) => setClientApproval(v)}
                disabled={approvalMode === "report_only"}
              />
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "review",
      label: "Review & launch",
      description: "One last look",
      render: () => (
        <div className="space-y-5">
          <StepHeader
            title="Ready to launch?"
            description={`We'll provision ${name || "the practice"} and generate a starter batch of ~36 creatives from your chosen matrix.`}
          />
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Summary</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <SummaryRow label="Practice" value={name || "—"} />
              <SummaryRow label="City" value={city || "—"} />
              <SummaryRow label="Website" value={website || "—"} />
              <SummaryRow label="Contact" value={contactName || "—"} />
              <SummaryRow label="Topics" value={`${activeTopics.size} active`} />
              <SummaryRow label="Personas" value={`${activePersonas.size} active`} />
              <SummaryRow label="Monthly budget" value={gbp(monthlyBudget)} />
              <SummaryRow label="Primary goal" value={primaryGoal} />
              <SummaryRow
                label="Approval"
                value={
                  approvalMode === "auto"
                    ? "Auto"
                    : approvalMode === "approve_everything"
                      ? clientApproval ? "Agency + client sign-off" : "Agency only"
                      : "Report only"
                }
              />
              <SummaryRow
                label="Connections"
                value={[metaConn === "connected" && "Meta", googleConn === "connected" && "Google", pixelConn === "connected" && "Pixel"].filter(Boolean).join(" · ") || "None yet"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Starter creatives</CardTitle></CardHeader>
            <CardContent className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div className="text-sm text-muted-foreground">
                On launch, we&apos;ll generate{" "}
                <span className="text-foreground font-medium">
                  {Math.min(200, activeTopics.size * activePersonas.size * 3 * 2) || 12}
                </span>{" "}
                starter creatives from the first 3 topics × {activePersonas.size} personas × 3 templates × 2 formats.
                You can review them before they go anywhere.
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  const finish = () => {
    toast.success(`${name || "Client"} launched. Generating starter creatives…`);
    setTimeout(() => {
      toast.success("Starter creatives ready.");
      // Route to a real fixture client so the user sees a populated workspace.
      router.push("/clients/bright-smile/overview");
    }, 1200);
  };

  const saveDraft = () => toast.info("Draft saved. Pick it up any time.");

  return (
    <WizardShell
      title="Onboard a dental practice"
      description="An 8-step wizard. Takes about 3 minutes."
      steps={steps}
      onFinish={finish}
      onSaveDraft={saveDraft}
      finishLabel="Launch client"
    />
  );
}

// ---- step helpers ----------------------------------------------------------

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <label
          className="inline-block h-8 w-8 shrink-0 cursor-pointer rounded-md border"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}

function ConnectionCard({
  label,
  description,
  status,
  onConnect,
  required,
  extra,
}: {
  label: string;
  description: string;
  status: Connection;
  onConnect: () => void;
  required?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-medium">{label}</div>
            {required ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Required
              </span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {status === "connected" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <Button size="sm" onClick={onConnect}>
              <Plug className="h-3.5 w-3.5" /> Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalOption({
  value,
  label,
  description,
  current,
  onSelect,
}: {
  value: ApprovalMode;
  label: string;
  description: string;
  current: ApprovalMode;
  onSelect: (v: ApprovalMode) => void;
}) {
  const active = value === current;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
        active ? "border-primary bg-primary/5" : "hover:bg-muted/30",
      )}
    >
      <input
        type="radio"
        name="approvalMode"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
