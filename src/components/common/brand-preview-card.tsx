"use client";

import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import type { BrandKit } from "@/lib/fixtures";

/**
 * Self-contained live brand preview. Renders a plausible Meta feed ad using
 * ONLY the brand values passed in — no fixture lookup. Updates instantly as
 * the parent changes brand props.
 */
export function BrandPreviewCard({
  brand,
  logoInitials,
  clientName,
  headline,
  body,
  ctaLabel,
  displayUrl,
}: {
  brand: BrandKit;
  logoInitials: string;
  clientName: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  displayUrl?: string;
}) {
  const h = headline ?? "Straighten your smile · book a free Invisalign consultation";
  const b = body ?? "Discreet clear aligners, fitted by experienced dentists. £0 consultations this month.";
  const cta = ctaLabel ?? "Book now";
  const domain = displayUrl ?? `${clientName.toLowerCase().replace(/[^a-z]/g, "")}.co.uk`;

  return (
    <div className="mx-auto max-w-[360px] overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Profile header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold text-white"
          style={{ backgroundColor: brand.primary }}
        >
          {logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight">{clientName}</div>
          <div className="text-[11px] text-muted-foreground">Sponsored</div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Primary text (body) */}
      <div className="px-3 pb-2.5 text-[13px] leading-snug">{b}</div>

      {/* Image area — rendered using brand colours as template cues */}
      <div
        className="relative aspect-square w-full"
        style={{ backgroundColor: brand.background, color: brand.text }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-end p-5"
          style={{ backgroundColor: brand.primary, color: "#fff" }}
        >
          <div
            className="text-xl font-bold leading-tight line-clamp-3"
            style={{ fontFamily: brand.fontPrimary }}
          >
            {h}
          </div>
          <div
            className="mt-2 h-1 w-10 rounded-full"
            style={{ backgroundColor: brand.secondary }}
          />
        </div>
        <div
          className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-md text-[11px] font-semibold text-white"
          style={{ backgroundColor: brand.secondary }}
          aria-hidden
        >
          {logoInitials}
        </div>
      </div>

      {/* Link card */}
      <div className="flex items-center gap-3 border-t bg-muted/20 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {domain}
          </div>
          <div
            className="truncate text-[13px] font-semibold"
            style={{ fontFamily: brand.fontPrimary }}
          >
            {h}
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md px-3 py-1.5 text-[11px] font-medium whitespace-nowrap"
          style={{ backgroundColor: brand.accent, color: brand.text }}
        >
          {cta}
        </button>
      </div>

      {/* Reaction bar */}
      <div className="flex items-center gap-4 border-t px-3 py-2 text-muted-foreground">
        <Heart className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
        <Send className="h-4 w-4" />
      </div>
    </div>
  );
}
