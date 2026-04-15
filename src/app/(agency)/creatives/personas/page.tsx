import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clients,
  creatives,
  personas,
} from "@/lib/fixtures";

export const metadata = { title: "Personas" };

export default function PersonasPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground max-w-xl">
          Personas inform the copy-synthesis side of the matrix. Each persona
          carries tone adjustments and likely concerns.
        </p>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" /> New persona
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((p) => {
          const clientCount = clients.filter((c) => c.personaIds.includes(p.id)).length;
          const creativeCount = creatives.filter((c) => c.personaId === p.id).length;
          return (
            <Card key={p.id}>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.description}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Typical concerns</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.concerns.map((c) => (
                      <span key={c} className="rounded-full border bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tone adjustments</div>
                  <div className="mt-1 rounded-md bg-muted/40 p-2 text-xs italic">
                    &ldquo;{p.toneAdjustments}&rdquo;
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">{clientCount}</span> client
                    {clientCount === 1 ? "" : "s"} using
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{creativeCount}</span> creative
                    {creativeCount === 1 ? "" : "s"}
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
