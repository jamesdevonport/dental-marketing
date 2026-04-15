"use client";

import { useState } from "react";
import { Archive, FileText, PauseCircle, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ApprovalMode, Client, LeadForm } from "@/lib/fixtures";
import { gbp } from "@/lib/format";

const APPROVAL_OPTIONS: {
  value: ApprovalMode;
  label: string;
  description: string;
}[] = [
  {
    value: "auto",
    label: "Auto-approve routine actions",
    description:
      "Agent publishes new creatives and routine fixes without asking. You're still notified.",
  },
  {
    value: "approve_everything",
    label: "Approve everything",
    description:
      "Every new creative, pause, launch, and refresh routes through the agent inbox before acting.",
  },
  {
    value: "report_only",
    label: "Report only (agent never acts)",
    description:
      "Agent monitors and reports but never publishes, pauses, or edits. Manual launches only.",
  },
];

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  full_name: "Full name",
  preferred_time: "Preferred time",
  service_interest: "Service interest",
};

export function ClientSettings({
  client: initial,
  leadForms,
}: {
  client: Client;
  leadForms: LeadForm[];
}) {
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>(
    initial.approvalMode,
  );
  const [clientApproval, setClientApproval] = useState<boolean>(
    initial.clientApprovalRequired,
  );
  const [monthlyBudget, setMonthlyBudget] = useState<number>(
    initial.monthlyBudget,
  );
  const [contactName, setContactName] = useState(initial.primaryContact.name);
  const [contactEmail, setContactEmail] = useState(initial.primaryContact.email);
  const [contactPhone, setContactPhone] = useState(initial.primaryContact.phone);
  const [ctaPhone, setCtaPhone] = useState(initial.ctaPhoneNumber ?? "");
  const [editingForm, setEditingForm] = useState<LeadForm | null>(null);
  const [dirty, setDirty] = useState(false);

  const touch = () => setDirty(true);

  const save = () => {
    toast.success("Settings saved. (wireframe: no persistence)");
    setDirty(false);
  };

  const pauseAll = () =>
    toast.info(`All campaigns for ${initial.name} paused. (wireframe)`);
  const archive = () =>
    toast.info(`${initial.name} archived. (wireframe)`);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {dirty ? (
        <div className="sticky top-[96px] z-10 flex items-center justify-between rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          <span className="text-warning-foreground">Unsaved changes.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setDirty(false); toast.info("Reverted."); }}>
              Revert
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
      ) : null}

      {/* Approval mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Agent approval policy</CardTitle>
          <p className="text-xs text-muted-foreground">
            Controls where new creatives route before going live.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {APPROVAL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                approvalMode === opt.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/30",
              )}
            >
              <input
                type="radio"
                name="approvalMode"
                value={opt.value}
                checked={approvalMode === opt.value}
                onChange={() => {
                  setApprovalMode(opt.value);
                  touch();
                }}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </div>
            </label>
          ))}

          <Separator />

          <label
            className={cn(
              "flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3",
              approvalMode === "report_only" && "pointer-events-none opacity-50",
            )}
          >
            <div>
              <div className="text-sm font-medium">Route to client for sign-off</div>
              <div className="text-xs text-muted-foreground">
                After agency approval, creatives also need to be approved in the
                practice&apos;s portal before they go live.
              </div>
            </div>
            <Switch
              checked={clientApproval && approvalMode !== "report_only"}
              onCheckedChange={(v: boolean) => {
                setClientApproval(v);
                touch();
              }}
              disabled={approvalMode === "report_only"}
            />
          </label>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Budget</CardTitle>
          <p className="text-xs text-muted-foreground">
            Monthly spend cap across Meta + Google. Split is automatic.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Monthly budget</Label>
            <span className="text-lg font-semibold tabular-nums">
              {gbp(monthlyBudget)}
            </span>
          </div>
          <Slider
            min={500}
            max={20000}
            step={100}
            value={[monthlyBudget]}
            onValueChange={(v: number | readonly number[]) => {
              const first = Array.isArray(v) ? v[0] : v;
              setMonthlyBudget(typeof first === "number" ? first : monthlyBudget);
              touch();
            }}
          />
          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
            <div>Meta: <span className="text-foreground">{gbp(Math.round(monthlyBudget * 0.7))}/mo</span></div>
            <div>Google: <span className="text-foreground">{gbp(Math.round(monthlyBudget * 0.3))}/mo</span></div>
            <div>Daily cap: <span className="text-foreground">{gbp(Math.round(monthlyBudget / 30))}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Primary contact</CardTitle>
          <p className="text-xs text-muted-foreground">
            Where reports and approval notifications are sent.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => { setContactName(e.target.value); touch(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => { setContactEmail(e.target.value); touch(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={contactPhone}
              onChange={(e) => { setContactPhone(e.target.value); touch(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cta-phone">CTA phone (click-to-call)</Label>
            <Input
              id="cta-phone"
              value={ctaPhone}
              onChange={(e) => { setCtaPhone(e.target.value); touch(); }}
              placeholder="Defaults to primary contact"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-medium">Lead forms</CardTitle>
            <p className="text-xs text-muted-foreground">
              Instant Forms on Meta. Referenced by ads with a lead-form destination.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.info("New lead form builder opens here.")}>
            <Plus className="h-3.5 w-3.5" /> New form
          </Button>
        </CardHeader>
        <CardContent>
          {leadForms.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No lead forms yet. Create one to use the lead-form destination on creatives.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {leadForms.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setEditingForm(f)}
                  className="group flex items-start gap-3 rounded-md border bg-card p-3 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="font-medium truncate">{f.name}</div>
                      <span
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                          f.status === "published"
                            ? "bg-success/15 text-success border-success/30"
                            : "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {f.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {f.fields.map((field) => (
                        <span
                          key={field}
                          className="rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {FIELD_LABELS[field]}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-destructive">Danger zone</CardTitle>
          <p className="text-xs text-muted-foreground">
            Bulk changes that affect every campaign on {initial.name}.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Pause all campaigns</div>
              <div className="text-xs text-muted-foreground">
                Immediately pauses every live campaign. No creatives are deleted.
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={pauseAll}>
              <PauseCircle className="h-3.5 w-3.5" /> Pause all
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Archive client</div>
              <div className="text-xs text-muted-foreground">
                Moves all data to archive. Reversible — you can restore within 90 days.
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={archive}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription className="text-xs">
          Changes here affect routing for future creatives and campaigns — they
          don&apos;t retroactively re-route creatives already mid-flight.
        </AlertDescription>
      </Alert>

      {/* Lead form Sheet */}
      <Sheet open={!!editingForm} onOpenChange={(o: boolean) => { if (!o) setEditingForm(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-[520px]">
          {editingForm ? (
            <>
              <SheetHeader>
                <SheetTitle>{editingForm.name}</SheetTitle>
                <SheetDescription>
                  Meta Instant Form. This is what shows to a user who taps the ad.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 p-6">
                <div className="space-y-1.5">
                  <Label>Form name</Label>
                  <Input defaultValue={editingForm.name} />
                </div>
                <div className="space-y-2">
                  <Label>Fields</Label>
                  <ul className="space-y-2">
                    {editingForm.fields.map((f) => (
                      <li
                        key={f}
                        className="flex items-center justify-between rounded-md border bg-card p-2.5 text-sm"
                      >
                        <span>{FIELD_LABELS[f]}</span>
                        <Button size="icon-sm" variant="ghost">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3.5 w-3.5" /> Add field
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label>Thank-you message</Label>
                  <Input defaultValue={editingForm.thankYouMessage} />
                </div>
              </div>
              <SheetFooter>
                <div className="flex w-full justify-end gap-2 border-t px-6 py-3">
                  <Button variant="outline" onClick={() => setEditingForm(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => { toast.success("Form saved."); setEditingForm(null); }}>
                    Save
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
