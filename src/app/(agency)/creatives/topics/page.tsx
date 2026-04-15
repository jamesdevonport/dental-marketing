import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clients,
  creatives,
  topics,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export const metadata = { title: "Topics" };

export default function TopicsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground max-w-xl">
          Shared service categories for the agency. Clients choose which topics
          are active for them in their own workspace, then the matrix generator
          combines those with personas and templates.
        </p>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" /> New topic
        </Button>
      </div>
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Topic</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Price band</th>
                  <th className="px-3 py-2 font-medium text-right">Client usage</th>
                  <th className="px-3 py-2 font-medium text-right">Creatives</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => {
                  const clientCount = clients.filter((c) => c.topicIds.includes(t.id)).length;
                  const creativeCount = creatives.filter((c) => c.topicId === t.id).length;
                  return (
                    <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-xs">{t.description}</td>
                      <td className="px-3 py-3">
                        <PriceBand band={t.priceRange} />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{clientCount}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{creativeCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PriceBand({ band }: { band: "budget" | "mid" | "premium" }) {
  const map = {
    budget: { label: "Budget", className: "bg-muted text-muted-foreground border-border" },
    mid: { label: "Mid-market", className: "bg-accent text-accent-foreground border-accent" },
    premium: { label: "Premium", className: "bg-primary/10 text-primary border-primary/20" },
  };
  const s = map[band];
  return (
    <span className={cn("inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium", s.className)}>
      {s.label}
    </span>
  );
}
