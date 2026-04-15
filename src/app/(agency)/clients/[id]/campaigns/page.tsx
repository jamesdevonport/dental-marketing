import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { campaignsByClient, clientById } from "@/lib/fixtures";

export const metadata = { title: "Campaigns" };

export default async function ClientCampaignsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const campaigns = campaignsByClient[id] ?? [];

  return (
    <ComingSoon
      title={`${client.name} campaigns table`}
      description={`Meta and Google tabs. Expandable rows for ad sets and ads. ${campaigns.length} campaigns in fixtures — ${campaigns.filter((c) => c.status === "active").length} active, ${campaigns.filter((c) => c.platform === "meta").length} Meta, ${campaigns.filter((c) => c.platform === "google").length} Google.`}
      bullets={[
        "Tabs: Meta / Google",
        "Columns: Name / Status / Budget / Spend 7d / Leads / CPL / CTR / Updated",
        "Inline status toggle (Active / Paused)",
        "Expandable rows → ad sets → ads with thumbnails",
        "Row actions: Edit, Duplicate, Pause, Archive, View insights",
      ]}
    />
  );
}
