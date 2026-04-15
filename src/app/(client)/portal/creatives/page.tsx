import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  clientById,
  creativesByClient,
  templateById,
  topicById,
} from "@/lib/fixtures";
import { CURRENT_PORTAL_CLIENT_ID } from "@/lib/portal";

export const metadata = { title: "Your live ads" };

export default function PortalCreativesPage() {
  const client = clientById[CURRENT_PORTAL_CLIENT_ID];
  const live = (creativesByClient[client.id] ?? []).filter(
    (c) => c.status === "live" || c.status === "paused",
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your live ads</h1>
        <p className="text-sm text-muted-foreground">
          Every ad currently running or paused on Meta. Tap one to see how it
          looks in a real feed.
        </p>
      </div>

      {live.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No ads running yet. Your agency will generate and submit creatives for your sign-off first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {live.map((c) => {
            const topic = topicById[c.topicId];
            const template = templateById[c.templateId];
            return (
              <Card key={c.id}>
                <CardContent className="space-y-2 p-3">
                  <CreativeThumbnail creative={c} size="md" className="w-full max-w-none" />
                  <div>
                    <div className="line-clamp-2 text-sm font-medium leading-snug">
                      {c.copy.headlines[0]}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {topic?.name} · {template.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`inline-flex h-4 items-center gap-1 rounded-full border px-1.5 font-medium ${c.status === "live" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === "live" ? "bg-success" : "bg-muted-foreground/50"}`} />
                      {c.status === "live" ? "Running" : "Paused"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="pt-2 text-xs text-muted-foreground">
        Want to change something? <Link href="/portal/approvals" className="underline underline-offset-2 hover:text-foreground">Your agency can send new ads for sign-off</Link>.
      </div>
    </div>
  );
}
