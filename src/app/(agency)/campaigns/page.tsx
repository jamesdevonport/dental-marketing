import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { campaigns } from "@/lib/fixtures";

export const metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        title="Campaigns"
        description="All Meta and Google campaigns across your book."
        actions={
          <Button asChild size="sm">
            <Link href="/campaigns/new">+ New campaign</Link>
          </Button>
        }
      />
      <ComingSoon
        phase={3}
        title="Cross-client campaigns table"
        description={`${campaigns.length} campaigns across all clients in fixtures. Same columns as the client-scoped view plus a Client column, so you can answer 'which of all my campaigns are underperforming?' at a glance.`}
        bullets={[
          "Client column for cross-book sorting",
          "Filters: client, platform, status, objective",
          "Inline status toggle + bulk actions",
        ]}
      />
    </>
  );
}
