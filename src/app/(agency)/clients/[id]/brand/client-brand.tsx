"use client";

import { useState } from "react";
import { History, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandPreviewCard } from "@/components/common/brand-preview-card";
import { cn } from "@/lib/utils";
import type { BrandKit, Client, Tone } from "@/lib/fixtures";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "warm", label: "Warm & reassuring", description: "Friendly, patient-first. Family practices, anxious audiences." },
  { value: "premium", label: "Premium & considered", description: "Understated confidence. Cosmetic, high-income audiences." },
  { value: "clinical", label: "Clinical & trustworthy", description: "Precise, evidence-led. Specialists, orthodontics." },
  { value: "fun", label: "Fun & modern", description: "Playful, direct. Young professionals, emerging brands." },
];

const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Source Serif Pro",
  "DM Sans",
  "Work Sans",
  "IBM Plex Sans",
];

export function ClientBrand({ client }: { client: Client }) {
  const [brand, setBrand] = useState<BrandKit>(client.brand);
  const [dirty, setDirty] = useState(false);

  const patch = (p: Partial<BrandKit>) => {
    setBrand((b) => ({ ...b, ...p }));
    setDirty(true);
  };

  const reset = () => {
    setBrand(client.brand);
    setDirty(false);
    toast.info("Reverted to saved brand.");
  };

  const save = () => {
    toast.success("Brand saved. (wireframe: no persistence)");
    setDirty(false);
  };

  const extractFromLogo = () => {
    toast.info("Extracting palette from logo… (wireframe)");
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left — editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-medium">Logo</CardTitle>
                <p className="text-xs text-muted-foreground">
                  PNG or SVG. We&apos;ll auto-invert for dark backgrounds.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border text-xl font-semibold text-white"
                style={{ backgroundColor: brand.primary }}
              >
                {client.logoInitials}
              </div>
              <div className="space-y-1.5">
                <Button size="sm" variant="outline" onClick={() => toast.info("Upload opens a file picker in the real build.")}>
                  Upload logo
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Placeholder initials &mdash; upload the real logo to replace.
                </p>
              </div>
              <div className="ml-auto">
                <Button size="sm" variant="outline" onClick={extractFromLogo}>
                  <Wand2 className="h-3.5 w-3.5" /> Extract colours
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Palette</CardTitle>
              <p className="text-xs text-muted-foreground">
                Five core colours. Changes reflect in the preview instantly.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <ColorField label="Primary" value={brand.primary} onChange={(v) => patch({ primary: v })} />
                <ColorField label="Secondary" value={brand.secondary} onChange={(v) => patch({ secondary: v })} />
                <ColorField label="Accent" value={brand.accent} onChange={(v) => patch({ accent: v })} />
                <ColorField label="Background" value={brand.background} onChange={(v) => patch({ background: v })} />
                <ColorField label="Text" value={brand.text} onChange={(v) => patch({ text: v })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Typography</CardTitle>
              <p className="text-xs text-muted-foreground">
                Primary font is used for headlines. Secondary for supporting copy.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Primary font</Label>
                <Select
                  value={brand.fontPrimary}
                  onValueChange={(v: string | null) => { if (v) patch({ fontPrimary: v }); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Secondary font</Label>
                <Select
                  value={brand.fontSecondary}
                  onValueChange={(v: string | null) => { if (v) patch({ fontSecondary: v }); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tone of voice</CardTitle>
              <p className="text-xs text-muted-foreground">
                Feeds into copy synthesis — tone adjusts the phrasing the matrix
                generator produces.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {TONE_OPTIONS.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                    brand.tone === t.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30",
                  )}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t.value}
                    checked={brand.tone === t.value}
                    onChange={() => patch({ tone: t.value })}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right — sticky preview */}
        <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Live preview</h3>
              <p className="text-xs text-muted-foreground">
                An actual ad, rendered in your brand.
              </p>
            </div>
            {dirty ? (
              <span className="inline-flex h-5 items-center rounded-full border border-warning/40 bg-warning/15 px-2 text-[10px] font-medium text-warning-foreground">
                Unsaved changes
              </span>
            ) : null}
          </div>
          <BrandPreviewCard
            brand={brand}
            logoInitials={client.logoInitials}
            clientName={client.name}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={reset} disabled={!dirty}>
              <History className="h-3.5 w-3.5" /> Revert
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" /> Save brand
            </Button>
          </div>
        </div>
      </div>
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
          aria-label={`${label} colour picker`}
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
