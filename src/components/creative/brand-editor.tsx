"use client";

import { useState } from "react";
import {
  History,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

type ImageCategory = "interior" | "team" | "treatments" | "patients" | "other";

const CATEGORIES: { key: ImageCategory; label: string; description: string }[] = [
  { key: "interior", label: "Practice interior", description: "Reception, treatment rooms, waiting area." },
  { key: "team", label: "Team", description: "Dentists, hygienists, receptionists." },
  { key: "treatments", label: "Treatments", description: "Before/after shots, procedure images." },
  { key: "patients", label: "Patients", description: "Consented patient photos." },
  { key: "other", label: "Other", description: "Anything that doesn't fit elsewhere." },
];

/**
 * Procedural mock library. In production this comes from the client's uploaded
 * image assets. For the wireframe we seed each category with a plausible count.
 */
function mockLibrary(client: Client): Record<ImageCategory, string[]> {
  const seed = [...client.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const rnd = (n: number, max: number) => ((seed * (n + 7)) % max) + 2;
  return {
    interior: Array.from({ length: rnd(1, 6) }, (_, i) => `int-${i}`),
    team: Array.from({ length: rnd(2, 5) }, (_, i) => `team-${i}`),
    treatments: Array.from({ length: rnd(3, 7) }, (_, i) => `trt-${i}`),
    patients: Array.from({ length: rnd(4, 4) }, (_, i) => `pat-${i}`),
    other: Array.from({ length: rnd(5, 3) }, (_, i) => `oth-${i}`),
  };
}

export function BrandEditor({ client }: { client: Client }) {
  const [brand, setBrand] = useState<BrandKit>(client.brand);
  const [dirty, setDirty] = useState(false);
  const [library, setLibrary] = useState(() => mockLibrary(client));

  const patch = (p: Partial<BrandKit>) => {
    setBrand((b) => ({ ...b, ...p }));
    setDirty(true);
  };

  const reset = () => {
    setBrand(client.brand);
    setLibrary(mockLibrary(client));
    setDirty(false);
    toast.info("Reverted to saved brand.");
  };

  const save = () => {
    toast.success("Brand saved. (wireframe: no persistence)");
    setDirty(false);
  };

  const extractFromLogo = () =>
    toast.info("Extracting palette from logo… (wireframe)");

  const addImage = (category: ImageCategory) => {
    setLibrary((l) => ({
      ...l,
      [category]: [...l[category], `${category}-${Date.now()}`],
    }));
    setDirty(true);
    toast.success(`Added to ${category}. (wireframe)`);
  };

  const removeImage = (category: ImageCategory, id: string) => {
    setLibrary((l) => ({
      ...l,
      [category]: l[category].filter((x) => x !== id),
    }));
    setDirty(true);
  };

  const totalImages = Object.values(library).reduce((n, arr) => n + arr.length, 0);

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
                  <Upload className="h-3.5 w-3.5" /> Upload logo
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

          {/* Library images */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-medium">Library images</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Photography the matrix generator pulls from when building
                  creatives. Organise by category so the right kind of image
                  ends up on the right kind of ad.
                </p>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {totalImages} image{totalImages === 1 ? "" : "s"}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="interior">
                <TabsList>
                  {CATEGORIES.map((c) => (
                    <TabsTrigger key={c.key} value={c.key}>
                      {c.label}
                      <span className="ml-1.5 rounded-full bg-muted px-1 text-[10px] text-muted-foreground tabular-nums">
                        {library[c.key].length}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {CATEGORIES.map((c) => (
                  <TabsContent key={c.key} value={c.key} className="space-y-3">
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                      {library[c.key].map((id) => (
                        <LibraryTile
                          key={id}
                          brand={brand}
                          onRemove={() => removeImage(c.key, id)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addImage(c.key)}
                        className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-muted/20 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-[11px] font-medium">Add photo</span>
                      </button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
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

function LibraryTile({
  brand,
  onRemove,
}: {
  brand: BrandKit;
  onRemove: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
      {/* Procedural mock — neutral gradient in brand colours with an image icon. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${brand.accent} 0%, ${brand.secondary} 100%)`,
          opacity: 0.65,
        }}
      />
      <div className="absolute inset-0 grid place-items-center text-white/80">
        <ImageIcon className="h-6 w-6" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-destructive opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
        aria-label="Remove photo"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
