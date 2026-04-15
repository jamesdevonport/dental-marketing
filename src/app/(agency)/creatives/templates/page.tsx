import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  clients,
  creatives,
  templates,
  type TemplateId,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground max-w-xl">
          Shared layout skeletons for every client. The matrix generator fills
          these with client brand values and per-creative copy.
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/creatives/templates/new">Request custom template</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const usage = creatives.filter((c) => c.templateId === t.id).length;
          return (
            <Card key={t.id} className="overflow-hidden">
              <ThumbRow templateId={t.id} />
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  <Link
                    href={`/creatives/templates/${t.id}`}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {t.supportedFormats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border bg-card px-1.5 py-0.5 capitalize text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    Used by {usage} creative{usage === 1 ? "" : "s"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ThumbRow({ templateId }: { templateId: TemplateId }) {
  // Show the template rendered across 3 different brands so operators can see
  // it flex. Each thumbnail is a synthesised creative with minimal copy.
  const samples = clients.slice(0, 3).map((client) => {
    const sample = creatives.find(
      (c) => c.clientId === client.id && c.templateId === templateId && c.format === "feed",
    );
    return sample;
  });

  return (
    <div className="grid grid-cols-3 gap-2 p-3 pb-0">
      {samples.map((c, i) => (
        <div key={i} className={cn("min-w-0", !c && "opacity-20")}>
          {c ? <CreativeThumbnail creative={c} size="md" className="w-full max-w-none" /> : (
            <div className="aspect-square w-full rounded-md border border-dashed" />
          )}
        </div>
      ))}
    </div>
  );
}
