"use client";

import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { CreativeThumbnail } from "./thumbnail";
import { cn } from "@/lib/utils";
import { clientById } from "@/lib/fixtures";
import type { Creative } from "@/lib/fixtures";

const CTA_LABEL: Record<string, string> = {
  LEARN_MORE: "Learn more",
  BOOK_NOW: "Book now",
  CALL_NOW: "Call now",
  SIGN_UP: "Sign up",
  REQUEST_TIME: "Request appointment",
  CONTACT_US: "Contact us",
};

type PlacementPreview = "feed" | "stories";

export function MetaPreview({
  creative,
  defaultPlacement,
  className,
}: {
  creative: Creative;
  defaultPlacement?: PlacementPreview;
  className?: string;
}) {
  const initial: PlacementPreview =
    defaultPlacement ?? (creative.format === "story" ? "stories" : "feed");
  const [placement, setPlacement] = useState<PlacementPreview>(initial);
  const client = clientById[creative.clientId];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Meta preview
        </div>
        <ToggleGroup
          value={[placement]}
          onValueChange={(v: string[]) => {
            const next = v[0];
            if (next) setPlacement(next as PlacementPreview);
          }}
          size="sm"
        >
          <ToggleGroupItem value="feed">Feed</ToggleGroupItem>
          <ToggleGroupItem value="stories">Stories</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {placement === "feed" ? (
        <FeedPreview creative={creative} />
      ) : (
        <StoriesPreview creative={creative} />
      )}

      <div className="text-[11px] text-muted-foreground">
        Showing variant A of {creative.copy.headlines.length} headline(s),{" "}
        {creative.copy.bodies.length} body/ies,{" "}
        {creative.copy.descriptions.length} description(s). Meta rotates variants
        automatically when dynamic creative is enabled.
      </div>
    </div>
  );
}

function FeedPreview({ creative }: { creative: Creative }) {
  const client = clientById[creative.clientId];
  const headline = creative.copy.headlines[0] ?? creative.name;
  const body = creative.copy.bodies[0] ?? "";
  const description = creative.copy.descriptions[0] ?? "";
  const ctaLabel = CTA_LABEL[creative.copy.ctaType] ?? "Learn more";
  const displayUrl =
    creative.destination.type === "website"
      ? creative.destination.displayUrl ?? creative.destination.url.replace(/^https?:\/\//, "")
      : creative.destination.type === "phone_call"
        ? creative.destination.phoneNumber
        : `${client.websiteUrl.replace(/^https?:\/\//, "")} · Instant form`;

  return (
    <div className="mx-auto max-w-[360px] overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Profile header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold text-white"
          style={{ backgroundColor: client.brand.primary }}
        >
          {client.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight">{client.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Sponsored</span>
            <span aria-hidden>·</span>
            <span className="underline decoration-dotted underline-offset-2">Paid partnership</span>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Primary text (body) */}
      {body ? (
        <div className="px-3 pb-2.5 text-[13px] leading-snug">{body}</div>
      ) : null}

      {/* Image */}
      <div className="bg-muted/40">
        <CreativeThumbnail creative={creative} size="lg" className="w-full" />
      </div>

      {/* Link card */}
      <div className="flex items-center gap-3 border-t bg-muted/20 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {displayUrl}
          </div>
          <div className="truncate text-[13px] font-semibold">{headline}</div>
          {description ? (
            <div className="truncate text-[11px] text-muted-foreground">{description}</div>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md bg-muted px-3 py-1.5 text-[11px] font-medium whitespace-nowrap hover:bg-muted/70"
        >
          {ctaLabel}
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

function StoriesPreview({ creative }: { creative: Creative }) {
  const client = clientById[creative.clientId];
  const headline = creative.copy.headlines[0] ?? creative.name;
  const ctaLabel = CTA_LABEL[creative.copy.ctaType] ?? "Learn more";

  return (
    <div
      className="mx-auto overflow-hidden rounded-2xl border shadow-sm"
      style={{
        width: 240,
        height: 427, // ≈ 9:16
        backgroundColor: client.brand.background,
      }}
    >
      <div className="relative h-full w-full">
        {/* Story image / template cue fills the card */}
        <div className="absolute inset-0">
          <CreativeThumbnail creative={creative} size="lg" className="h-full w-full" />
        </div>
        {/* Top progress bar */}
        <div className="absolute left-0 right-0 top-2 flex gap-1 px-2">
          <div className="h-0.5 flex-1 rounded-full bg-white/80" />
          <div className="h-0.5 flex-1 rounded-full bg-white/30" />
          <div className="h-0.5 flex-1 rounded-full bg-white/30" />
        </div>
        {/* Profile pill */}
        <div className="absolute left-3 top-5 flex items-center gap-1.5 rounded-full bg-black/40 px-1.5 py-1 backdrop-blur-sm">
          <div
            className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-semibold text-white"
            style={{ backgroundColor: client.brand.primary }}
          >
            {client.logoInitials}
          </div>
          <span className="text-[11px] font-medium text-white">{client.name}</span>
          <span className="text-[9px] text-white/70">· Sponsored</span>
        </div>
        {/* Headline overlay near bottom */}
        <div className="absolute inset-x-3 bottom-16 rounded-md bg-black/50 p-2 backdrop-blur-sm">
          <div className="line-clamp-3 text-[12px] font-semibold leading-tight text-white">
            {headline}
          </div>
        </div>
        {/* Swipe-up / CTA bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center">
          <button
            type="button"
            className="w-full rounded-full bg-white py-2 text-[11px] font-semibold text-neutral-900 shadow-md"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
