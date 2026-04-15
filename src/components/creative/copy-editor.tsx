"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CreativeCopy, CtaType } from "@/lib/fixtures";

const CTA_OPTIONS: { value: CtaType; label: string }[] = [
  { value: "BOOK_NOW", label: "Book now" },
  { value: "LEARN_MORE", label: "Learn more" },
  { value: "CALL_NOW", label: "Call now" },
  { value: "SIGN_UP", label: "Sign up" },
  { value: "REQUEST_TIME", label: "Request appointment" },
  { value: "CONTACT_US", label: "Contact us" },
];

const LIMITS = {
  headlines: { max: 5, hard: 40, soft: 40, label: "Headline", hint: "≤40 chars recommended" },
  bodies: { max: 5, hard: 500, soft: 125, label: "Primary text", hint: "≤125 chars before truncation" },
  descriptions: { max: 5, hard: 30, soft: 30, label: "Description", hint: "≤30 chars recommended" },
} as const;

export function CreativeCopyEditor({
  value,
  onChange,
  readOnly,
  className,
}: {
  value: CreativeCopy;
  onChange?: (next: CreativeCopy) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const update = (patch: Partial<CreativeCopy>) => {
    onChange?.({ ...value, ...patch });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <VariantField
        kind="headlines"
        values={value.headlines}
        onChange={(v) => update({ headlines: v })}
        readOnly={readOnly}
      />
      <VariantField
        kind="bodies"
        values={value.bodies}
        onChange={(v) => update({ bodies: v })}
        readOnly={readOnly}
      />
      <VariantField
        kind="descriptions"
        values={value.descriptions}
        onChange={(v) => update({ descriptions: v })}
        readOnly={readOnly}
      />

      <div className="space-y-1.5">
        <Label htmlFor="cta-select">Call-to-action button</Label>
        {readOnly ? (
          <div className="text-sm">
            {CTA_OPTIONS.find((o) => o.value === value.ctaType)?.label ?? value.ctaType}
          </div>
        ) : (
          <Select
            value={value.ctaType}
            onValueChange={(next: string | null) => {
              if (next) update({ ctaType: next as CtaType });
            }}
          >
            <SelectTrigger id="cta-select" className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          Meta renders this as the button pill on the ad. Must match the destination
          (e.g. <code className="text-foreground">CALL_NOW</code> for click-to-call).
        </p>
      </div>
    </div>
  );
}

function VariantField({
  kind,
  values,
  onChange,
  readOnly,
}: {
  kind: keyof typeof LIMITS;
  values: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}) {
  const spec = LIMITS[kind];
  const add = () => onChange([...values, ""]);
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const set = (i: number, next: string) =>
    onChange(values.map((v, idx) => (idx === i ? next : v)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{spec.label}s</Label>
        <span className="text-xs text-muted-foreground">
          {values.length} / {spec.max} · {spec.hint}
        </span>
      </div>
      <ul className="space-y-2">
        {values.map((v, i) => {
          const overSoft = v.length > spec.soft;
          return (
            <li key={i} className="flex items-start gap-2">
              <div className="mt-2 w-5 shrink-0 text-center text-[11px] font-medium tabular-nums text-muted-foreground">
                {String.fromCharCode(65 + i)}
              </div>
              <div className="flex-1 space-y-1">
                {kind === "bodies" ? (
                  <Textarea
                    value={v}
                    onChange={(e) => set(i, e.target.value)}
                    readOnly={readOnly}
                    rows={2}
                    className={cn(overSoft && "border-warning focus-visible:ring-warning/30")}
                  />
                ) : (
                  <Input
                    value={v}
                    onChange={(e) => set(i, e.target.value)}
                    readOnly={readOnly}
                    className={cn(overSoft && "border-warning focus-visible:ring-warning/30")}
                  />
                )}
                <div
                  className={cn(
                    "flex justify-between text-[11px]",
                    overSoft ? "text-warning-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>
                    {overSoft
                      ? `${v.length} chars · may truncate`
                      : `${v.length} chars`}
                  </span>
                </div>
              </div>
              {!readOnly && values.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${spec.label.toLowerCase()} ${i + 1}`}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {!readOnly && values.length < spec.max ? (
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add {spec.label.toLowerCase()} variant
        </Button>
      ) : null}
    </div>
  );
}
