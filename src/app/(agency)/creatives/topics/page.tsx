import { ComingSoon } from "@/components/layout/coming-soon";
import { topics } from "@/lib/fixtures";

export const metadata = { title: "Topics" };

export default function TopicsPage() {
  return (
    <ComingSoon
      title="Editable topics library"
      description={`${topics.length} dental topics in fixtures (teeth whitening, Invisalign, implants, emergency, check-ups, veneers, bonding, children, dentures, root canal). Editable table with typical price range and example headline/subheadline hooks.`}
    />
  );
}
