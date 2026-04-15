import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { campaignById, clientById } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CampaignDetailView } from "./campaign-detail";

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
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href={`/clients/${client.id}/campaigns/${campaign.id}`}>
              Open in client workspace
            </Link>
          </Button>
        }
      />
      <CampaignDetailView campaign={campaign} scope="cross-client" />
    </>
  );
}
