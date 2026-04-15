import { notFound } from "next/navigation";
import { campaignById } from "@/lib/fixtures";
import { CampaignDetailView } from "@/app/(agency)/campaigns/[id]/campaign-detail";

export const metadata = { title: "Campaign" };

export default async function ClientCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string; campaignId: string }>;
}) {
  const { id, campaignId } = await params;
  const campaign = campaignById[campaignId];

  if (!campaign || campaign.clientId !== id) notFound();

  return <CampaignDetailView campaign={campaign} scope="client" />;
}
