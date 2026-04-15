import { ComingSoon } from "@/components/layout/coming-soon";
import { creatives } from "@/lib/fixtures";

export const metadata = { title: "Ad directory" };

export default function CrossClientCreativesPage() {
  return (
    <ComingSoon
      title="Cross-client Ad Directory"
      description={`${creatives.length} creatives across all clients in fixtures. Same faceted directory as the per-client view, with an extra 'Client' facet — useful for finding top-performing implant ads across practices and porting them.`}
      bullets={[
        "Extra 'Client' facet in the rail",
        "Best-performing / worst-performing sort",
        "'Port to another client' action (rebrands on copy)",
      ]}
    />
  );
}
