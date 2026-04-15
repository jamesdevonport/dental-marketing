import { notFound } from "next/navigation";
import { CampaignWizard } from "@/app/(agency)/campaigns/new/campaign-wizard";
import { clientById } from "@/lib/fixtures";

export const metadata = { title: "New campaign" };

export default async function ClientNewCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!clientById[id]) notFound();
  return <CampaignWizard initialClientId={id} />;
}
