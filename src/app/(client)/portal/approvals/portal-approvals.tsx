"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApprovalBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { MetaPreview } from "@/components/creative/meta-preview";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import { cn } from "@/lib/utils";
import type { Creative } from "@/lib/fixtures";
import { relativeTime } from "@/lib/format";

type Decision = "pending" | "approved" | "rejected";

export function PortalApprovals({
  creatives,
}: {
  creatives: Creative[];
}) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>(
    Object.fromEntries(creatives.map((c) => [c.id, "pending"])),
  );

  const pending = creatives.filter((c) => decisions[c.id] === "pending");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Your agency has shared {creatives.length} new ad creative
          {creatives.length === 1 ? "" : "s"} for sign-off. Nothing goes live
          until you approve.
        </p>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          icon={<Check className="h-4 w-4" />}
          title="All caught up"
          description="Nothing needs your sign-off right now. We'll email you when new creatives are ready."
        />
      ) : (
        <ul className="space-y-4">
          {creatives.map((c) => (
            <li key={c.id}>
              <ApprovalCard
                creative={c}
                decision={decisions[c.id]}
                onApprove={(reason) => {
                  setDecisions((d) => ({ ...d, [c.id]: "approved" }));
                  toast.success("Approved. Thanks — we'll get this live.");
                }}
                onReject={(reason) => {
                  setDecisions((d) => ({ ...d, [c.id]: "rejected" }));
                  toast.info("Changes requested. Your agency will be notified.");
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApprovalCard({
  creative,
  decision,
  onApprove,
  onReject,
}: {
  creative: Creative;
  decision: Decision;
  onApprove: (reason?: string) => void;
  onReject: (reason: string) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <Card className={cn(decision !== "pending" && "opacity-70")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generated {relativeTime(creative.generatedAt)}</span>
            </div>
            <CardTitle className="text-base font-semibold">
              {creative.copy.headlines[0]}
            </CardTitle>
          </div>
          {decision !== "pending" ? (
            <ApprovalBadge state={decision === "approved" ? "approved" : "rejected"} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What will run
              </div>
              <div className="space-y-2 rounded-md border bg-muted/20 p-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Headlines:</span>
                  <ul className="mt-1 space-y-0.5">
                    {creative.copy.headlines.map((h, i) => (
                      <li key={i}>
                        <span className="mr-1.5 text-[11px] font-medium text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Primary text:</span>
                  <ul className="mt-1 space-y-1">
                    {creative.copy.bodies.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Where clicks go
              </div>
              <div className="text-sm">
                {creative.destination.type === "website" ? (
                  <>Your website: <code className="text-xs">{creative.destination.url}</code></>
                ) : creative.destination.type === "lead_form" ? (
                  <>An instant lead form: <span className="font-medium">{creative.destination.leadFormName}</span></>
                ) : (
                  <>A direct phone call to <span className="font-medium">{creative.destination.phoneNumber}</span></>
                )}
              </div>
            </div>

            {decision === "pending" ? (
              rejectOpen ? (
                <div className="space-y-2">
                  <Label htmlFor={`reason-${creative.id}`}>What needs changing?</Label>
                  <Textarea
                    id={`reason-${creative.id}`}
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please don't mention price in the headline."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectOpen(false);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onReject(rejectReason);
                        setRejectOpen(false);
                      }}
                      disabled={!rejectReason.trim()}
                    >
                      Send changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRejectOpen(true)}>
                    <X className="h-3.5 w-3.5" /> Request changes
                  </Button>
                  <Button size="sm" onClick={() => onApprove()}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              )
            ) : null}
          </div>

          <div className="hidden sm:block">
            <MetaPreview creative={creative} defaultPlacement="feed" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
