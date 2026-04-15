import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { clientById, creativesByClient } from "@/lib/fixtures";

export const metadata = { title: "Creatives" };

export default async function ClientCreativesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const creatives = creativesByClient[id] ?? [];

  return (
    <ComingSoon
      phase={3}
      title={`Ad Directory — ${client.name}`}
      description={`Faceted filter rail + responsive grid. ${creatives.length} creatives for this client across ${new Set(creatives.map((c) => c.templateId)).size} templates and ${new Set(creatives.map((c) => c.topicId)).size} topics. This is the critical screen — how the user browses hundreds of matrix-generated ads.`}
      bullets={[
        "Facet rail: format, template, topic, persona, status, performance band, generated-by, date",
        "Grid tiles with thumbnail + format/topic/persona chips + status dot",
        "Tile size toggle (S / M / L)",
        "Hover: headline + body + CTA preview; click: side-panel detail",
        "Top actions: Generate creatives (matrix) / New single ad / bulk Launch / Pause / Export PNGs",
      ]}
    />
  );
}
