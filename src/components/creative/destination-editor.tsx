"use client";

import { Globe, Phone, SquarePen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type {
  CreativeDestination,
  DestinationType,
  LeadForm,
  UtmParams,
} from "@/lib/fixtures";

const PIXEL_EVENTS = [
  "Lead",
  "Schedule",
  "Contact",
  "FindLocation",
  "ViewContent",
] as const;

export function DestinationEditor({
  value,
  clientWebsiteUrl,
  clientPhone,
  clientLeadForms,
  onChange,
  readOnly,
  className,
}: {
  value: CreativeDestination;
  clientWebsiteUrl: string;
  clientPhone: string;
  clientLeadForms: LeadForm[];
  onChange?: (next: CreativeDestination) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const switchType = (next: DestinationType) => {
    if (next === value.type || !onChange) return;
    if (next === "website") {
      onChange({
        type: "website",
        url: `${clientWebsiteUrl}/book-online`,
        displayUrl: clientWebsiteUrl.replace(/^https?:\/\//, ""),
        utm: {
          source: "meta",
          medium: "paid_social",
          campaign: "",
          content: "",
        },
        pixelEventId: "Lead",
      });
    } else if (next === "lead_form") {
      const firstForm = clientLeadForms[0];
      onChange({
        type: "lead_form",
        leadFormId: firstForm?.id ?? "",
        leadFormName: firstForm?.name ?? "",
      });
    } else {
      onChange({ type: "phone_call", phoneNumber: clientPhone });
    }
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label className="text-sm">Destination type</Label>
        <ToggleGroup
          value={[value.type]}
          onValueChange={(v: string[]) => {
            const next = v[0];
            if (next) switchType(next as DestinationType);
          }}
          className="w-fit"
          disabled={readOnly}
        >
          <ToggleGroupItem value="website" aria-label="Website">
            <Globe className="h-3.5 w-3.5" /> Website
          </ToggleGroupItem>
          <ToggleGroupItem value="lead_form" aria-label="Lead form">
            <SquarePen className="h-3.5 w-3.5" /> Lead form
          </ToggleGroupItem>
          <ToggleGroupItem value="phone_call" aria-label="Phone call">
            <Phone className="h-3.5 w-3.5" /> Phone call
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Where a click on this ad actually goes. Must match the call-to-action
          button on the creative.
        </p>
      </div>

      {value.type === "website" ? (
        <WebsiteFields
          dest={value}
          readOnly={readOnly}
          onPatch={(patch) =>
            onChange?.({ ...value, ...patch, type: "website" })
          }
        />
      ) : null}

      {value.type === "lead_form" ? (
        <LeadFormFields
          dest={value}
          forms={clientLeadForms}
          readOnly={readOnly}
          onPatch={(patch) =>
            onChange?.({ ...value, ...patch, type: "lead_form" })
          }
        />
      ) : null}

      {value.type === "phone_call" ? (
        <PhoneFields
          dest={value}
          readOnly={readOnly}
          onPatch={(patch) =>
            onChange?.({ ...value, ...patch, type: "phone_call" })
          }
        />
      ) : null}
    </div>
  );
}

function WebsiteFields({
  dest,
  readOnly,
  onPatch,
}: {
  dest: Extract<CreativeDestination, { type: "website" }>;
  readOnly?: boolean;
  onPatch: (patch: Partial<Extract<CreativeDestination, { type: "website" }>>) => void;
}) {
  const setUtm = (patch: Partial<UtmParams>) =>
    onPatch({ utm: { ...dest.utm, ...patch } });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="dest-url">Destination URL</Label>
          <Input
            id="dest-url"
            value={dest.url}
            readOnly={readOnly}
            onChange={(e) => onPatch({ url: e.target.value })}
            placeholder="https://example.co.uk/service"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="display-url">Display URL</Label>
          <Input
            id="display-url"
            value={dest.displayUrl ?? ""}
            readOnly={readOnly}
            onChange={(e) => onPatch({ displayUrl: e.target.value })}
            placeholder="example.co.uk/service"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pixel-event">Conversion event (pixel)</Label>
          {readOnly ? (
            <div className="text-sm">{dest.pixelEventId ?? "—"}</div>
          ) : (
            <Select
              value={dest.pixelEventId ?? "Lead"}
              onValueChange={(v: string | null) => {
                if (v) onPatch({ pixelEventId: v });
              }}
            >
              <SelectTrigger id="pixel-event">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIXEL_EVENTS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          UTM parameters
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <UtmField label="Source" value={dest.utm.source} readOnly={readOnly} onChange={(v) => setUtm({ source: v })} />
          <UtmField label="Medium" value={dest.utm.medium} readOnly={readOnly} onChange={(v) => setUtm({ medium: v })} />
          <UtmField label="Campaign" value={dest.utm.campaign} readOnly={readOnly} onChange={(v) => setUtm({ campaign: v })} />
          <UtmField label="Content" value={dest.utm.content ?? ""} readOnly={readOnly} onChange={(v) => setUtm({ content: v })} />
          <UtmField label="Term (optional)" value={dest.utm.term ?? ""} readOnly={readOnly} onChange={(v) => setUtm({ term: v })} />
        </div>
      </div>
    </div>
  );
}

function UtmField({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">utm_{label.toLowerCase().replace(/\s+.*/, "")}</Label>
      <Input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 font-mono text-xs"
      />
    </div>
  );
}

function LeadFormFields({
  dest,
  forms,
  readOnly,
  onPatch,
}: {
  dest: Extract<CreativeDestination, { type: "lead_form" }>;
  forms: LeadForm[];
  readOnly?: boolean;
  onPatch: (patch: Partial<Extract<CreativeDestination, { type: "lead_form" }>>) => void;
}) {
  const published = forms.filter((f) => f.status === "published");
  const selected = forms.find((f) => f.id === dest.leadFormId);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="lead-form">Lead form</Label>
        {readOnly ? (
          <div className="text-sm">{dest.leadFormName}</div>
        ) : (
          <Select
            value={dest.leadFormId}
            onValueChange={(v: string | null) => {
              if (!v) return;
              const form = forms.find((f) => f.id === v);
              onPatch({
                leadFormId: v,
                leadFormName: form?.name ?? "",
              });
            }}
          >
            <SelectTrigger id="lead-form" className="w-full sm:w-[320px]">
              <SelectValue placeholder="Pick a lead form" />
            </SelectTrigger>
            <SelectContent>
              {published.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selected ? (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Form fields
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {selected.fields.map((f) => (
              <li
                key={f}
                className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground"
              >
                {f.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Thank you:</span> &ldquo;
            {selected.thankYouMessage}&rdquo;
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PhoneFields({
  dest,
  readOnly,
  onPatch,
}: {
  dest: Extract<CreativeDestination, { type: "phone_call" }>;
  readOnly?: boolean;
  onPatch: (patch: Partial<Extract<CreativeDestination, { type: "phone_call" }>>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="dest-phone">Phone number</Label>
      <Input
        id="dest-phone"
        value={dest.phoneNumber}
        readOnly={readOnly}
        onChange={(e) => onPatch({ phoneNumber: e.target.value })}
        placeholder="+44 ..."
        inputMode="tel"
      />
      <p className="text-xs text-muted-foreground">
        Click-to-call: on mobile, tapping the ad dials this number directly. CTA
        button must be <code className="text-foreground">CALL_NOW</code>.
      </p>
    </div>
  );
}
