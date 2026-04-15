import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { campaignById, clientById } from "@/lib/fixtures";

export const metadata = { title: "Campaign" };

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaignById[id];
  if (!campaign) notFound();
  const client = clientById[campaign.clientId];

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={`${client.name} · ${campaign.platform === "meta" ? "Meta" : "Google"} · ${campaign.status}`}
      />
      <ComingSoon
        phase={4}
        title="Campaign detail"
        description={`Ad sets → ads hierarchy, insights charts, and edit-in-place for ${campaign.name}. Currently £${campaign.spend7d.toFixed(0)} spend / ${campaign.leads7d} leads over 7d.`}
        bullets={[
          "Ad sets list with expandable ad rows",
          "Insights tabs: delivery, demographics, placements, creative breakdown",
          "Edit-in-place for budgets, schedules, targeting",
          "Agent notes inline (fatigue warnings, proposed changes)",
        ]}
      />
    </>
  );
}
