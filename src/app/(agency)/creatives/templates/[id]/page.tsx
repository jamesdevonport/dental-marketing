import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreativeThumbnail } from "@/components/creative/thumbnail";
import {
  clients,
  creatives,
  templateById,
} from "@/lib/fixtures";

export const metadata = { title: "Template" };

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = templateById[id];
  if (!template) notFound();

  const samples = clients
    .map((client) => {
      const hit = creatives.find(
        (c) => c.clientId === client.id && c.templateId === template.id,
      );
      return hit ? { client, creative: hit } : null;
    })
    .filter(Boolean) as { client: (typeof clients)[number]; creative: (typeof creatives)[number] }[];

  const totalUsage = creatives.filter((c) => c.templateId === template.id).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold tracking-tight">{template.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
            {template.supportedFormats.map((f) => (
              <span
                key={f}
                className="rounded-full border bg-card px-1.5 py-0.5 capitalize text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
          <div className="text-muted-foreground">Live usage</div>
          <div className="text-lg font-semibold tabular-nums text-foreground">{totalUsage}</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Rendered across brands</CardTitle>
          <p className="text-xs text-muted-foreground">
            Same template, real brand values pulled from each practice&apos;s brand kit.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {samples.map(({ client, creative }) => (
              <div key={client.id} className="space-y-2">
                <CreativeThumbnail creative={creative} size="md" className="w-full max-w-none" />
                <div className="flex items-center gap-1.5">
                  <span
                    className="grid h-4 w-4 place-items-center rounded-sm text-[9px] font-semibold text-white"
                    style={{ backgroundColor: client.brand.primary }}
                  >
                    {client.logoInitials}
                  </span>
                  <div className="text-xs font-medium truncate">{client.name}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Variable slots</CardTitle>
          <p className="text-xs text-muted-foreground">
            What this template pulls from each creative.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-muted text-[10px] font-semibold tabular-nums">A</span>
              <div>
                <div className="font-medium">Headline</div>
                <div className="text-xs text-muted-foreground">Appears as the primary text on the card. Rendered in brand primary font.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-muted text-[10px] font-semibold tabular-nums">B</span>
              <div>
                <div className="font-medium">Brand primary colour</div>
                <div className="text-xs text-muted-foreground">Used for the main background panel + CTA.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-muted text-[10px] font-semibold tabular-nums">C</span>
              <div>
                <div className="font-medium">Logo mark</div>
                <div className="text-xs text-muted-foreground">Corner badge in brand primary colour with practice initials.</div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
