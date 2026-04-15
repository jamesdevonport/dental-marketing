import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "New campaign" };

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader
        title="New campaign"
        description="Create a Meta or Google campaign from scratch."
      />
      <ComingSoon
        phase={4}
        title="Campaign builder wizard (6 steps)"
        description="Mirrors the Meta API hierarchy: objective → name & budget → ad sets → creatives → tracking → review."
        bullets={[
          "Objective with plain-English explanations (no jargon like 'CBO')",
          "Placement-aware creative picker — warns when format doesn't match placement",
          "Copy rotation preview (which headline lands on which ad)",
          "Estimated reach + daily impressions from Meta API",
          "Launch active / create paused / save as draft",
        ]}
      />
    </>
  );
}
