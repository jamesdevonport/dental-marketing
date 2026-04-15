import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { topics } from "@/lib/fixtures";

export const metadata = { title: "Topics" };

export default function TopicsPage() {
  return (
    <>
      <PageHeader
        title="Topics"
        description="The dental services library."
      />
      <ComingSoon
        phase={5}
        title="Editable topics library"
        description={`${topics.length} dental topics in fixtures (teeth whitening, Invisalign, implants, emergency, check-ups, veneers, bonding, children, dentures, root canal). Editable table with typical price range and example headline/subheadline hooks.`}
      />
    </>
  );
}
