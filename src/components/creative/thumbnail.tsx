import type { Creative, Format, TemplateId } from "@/lib/fixtures";
import { clientById } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

const ASPECT: Record<Format, string> = {
  feed: "1 / 1",
  story: "9 / 16",
  link: "1.91 / 1",
};

export function CreativeThumbnail({
  creative,
  size = "md",
  className,
}: {
  creative: Creative;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const client = clientById[creative.clientId];
  const brand = client.brand;

  const sizeClasses: Record<typeof size, string> = {
    sm: "w-[120px]",
    md: "w-full max-w-[220px]",
    lg: "w-full",
  };

  return (
    <div className={cn("shrink-0", sizeClasses[size], className)}>
      <div
        className="relative overflow-hidden rounded-md border shadow-sm"
        style={{
          aspectRatio: ASPECT[creative.format],
          backgroundColor: brand.background,
          color: brand.text,
        }}
      >
        <TemplateInner templateId={creative.templateId} creative={creative} />

        {/* Tiny logo corner — practice initials in brand primary */}
        <div
          className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-sm text-[9px] font-semibold text-white"
          style={{ backgroundColor: brand.primary }}
          aria-hidden
        >
          {client.logoInitials}
        </div>
      </div>
    </div>
  );
}

function TemplateInner({
  templateId,
  creative,
}: {
  templateId: TemplateId;
  creative: Creative;
}) {
  const client = clientById[creative.clientId];
  const brand = client.brand;

  switch (templateId) {
    case "event-promo":
      return (
        <div
          className="flex h-full w-full flex-col justify-end p-3"
          style={{ backgroundColor: brand.primary, color: "#fff" }}
        >
          <div
            className="text-[11px] font-bold leading-tight line-clamp-3"
            style={{ fontFamily: brand.fontPrimary }}
          >
            {creative.copy.headlines[0]}
          </div>
          <div className="mt-1 h-0.5 w-8" style={{ backgroundColor: brand.secondary }} />
        </div>
      );

    case "testimonial":
      return (
        <div
          className="flex h-full w-full flex-col justify-between p-3"
          style={{ backgroundColor: brand.background, color: brand.text }}
        >
          <div className="h-6" />
          <div
            className="text-[10px] italic leading-tight line-clamp-4"
            style={{ fontFamily: brand.fontSecondary }}
          >
            {creative.copy.headlines[0]}
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: brand.secondary }}
            />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-sm"
                    style={{ backgroundColor: brand.primary }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "community":
      return (
        <div
          className="grid h-full w-full grid-cols-2 gap-0.5 p-0.5"
          style={{ backgroundColor: brand.secondary }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: [brand.primary, brand.accent, brand.secondary, brand.background][i],
                opacity: 0.55 + (i % 2) * 0.25,
              }}
            />
          ))}
        </div>
      );

    case "comparison":
      return (
        <div className="relative grid h-full w-full grid-cols-2">
          <div
            className="relative flex items-end p-2"
            style={{ backgroundColor: brand.accent, color: brand.text }}
          >
            <span className="text-[8px] font-medium uppercase tracking-wider">Before</span>
          </div>
          <div
            className="relative flex items-end p-2"
            style={{ backgroundColor: brand.primary, color: "#fff" }}
          >
            <span className="text-[8px] font-medium uppercase tracking-wider">After</span>
          </div>
        </div>
      );

    case "apple-notes":
      return (
        <div
          className="flex h-full w-full flex-col gap-1 p-3"
          style={{ backgroundColor: "#FFFCE8", color: "#1A1A1A" }}
        >
          <div
            className="text-[11px] font-semibold leading-tight line-clamp-2"
            style={{ fontFamily: "ui-rounded, system-ui" }}
          >
            {creative.copy.headlines[0]}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full border",
                  i === 1 ? "bg-neutral-900 border-neutral-900" : "border-neutral-400",
                )}
              />
              <div className="h-1 flex-1 rounded-full bg-neutral-300" />
            </div>
          ))}
        </div>
      );

    case "imessage":
      return (
        <div
          className="flex h-full w-full flex-col justify-end gap-1 p-2"
          style={{ backgroundColor: "#F2F2F7" }}
        >
          <div className="flex">
            <div className="rounded-2xl rounded-bl-sm bg-neutral-300 px-2 py-1">
              <div className="h-1 w-10 rounded-full bg-neutral-500/70" />
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className="rounded-2xl rounded-br-sm px-2 py-1"
              style={{ backgroundColor: "#007AFF" }}
            >
              <div className="h-1 w-14 rounded-full bg-white/80" />
              <div className="mt-0.5 h-1 w-8 rounded-full bg-white/60" />
            </div>
          </div>
          <div className="flex">
            <div className="rounded-2xl rounded-bl-sm bg-neutral-300 px-2 py-1">
              <div className="h-1 w-8 rounded-full bg-neutral-500/70" />
            </div>
          </div>
        </div>
      );
  }
}
