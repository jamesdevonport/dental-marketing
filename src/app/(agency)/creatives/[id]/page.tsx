import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import {
  clientById,
  creativeById,
  personaById,
  templateById,
  topicById,
} from "@/lib/fixtures";

export const metadata = { title: "Creative" };

export default async function CreativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creative = creativeById[id];
  if (!creative) notFound();
  const client = clientById[creative.clientId];
  const template = templateById[creative.templateId];
  const topic = topicById[creative.topicId];
  const persona = personaById[creative.personaId];

  return (
    <>
      <div className="border-b bg-background px-4 py-3 md:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{creative.copy.headlines[0]}</h2>
        <p className="text-xs text-muted-foreground">
          {client.name} · {template.name} · {topic.name} · {persona.name} · {creative.format}
        </p>
      </div>
      <ComingSoon
        title="Creative detail"
        description="Large preview, format toggle, editable copy block, performance + variants + version history + agent notes. Usually opened as a side-panel over the Ad Directory, but deep-linkable."
        bullets={[
          "Large preview with Feed / Story / Link format toggle",
          "In-place editable copy: headline, body, description, CTA, destination URL",
          "Performance: impressions / clicks / CTR / spend / leads / CPL / CPM / frequency",
          "Variants row: sibling matrix creatives, click to switch",
          "Agent notes (fatigue signals, refresh proposals)",
          "Actions: Launch / Pause / Duplicate & edit / Archive / Regenerate (AI) / Replace image",
        ]}
      />
    </>
  );
}
