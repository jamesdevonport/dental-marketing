import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { creatives } from "@/lib/fixtures";

export const metadata = { title: "Creatives" };

export default function CrossClientCreativesPage() {
  return (
    <>
      <PageHeader
        title="Creatives"
        description="All creatives across all clients."
        actions={
          <Button asChild size="sm">
            <Link href="/creatives/new">+ Generate creatives</Link>
          </Button>
        }
      />
      <ComingSoon
        phase={3}
        title="Cross-client Ad Directory"
        description={`${creatives.length} creatives across all clients in fixtures. Same faceted directory as the per-client view, with an extra 'Client' facet — useful for finding top-performing implant ads across practices and porting them.`}
        bullets={[
          "Extra 'Client' facet in the rail",
          "Best-performing / worst-performing sort",
          "'Port to another client' action (rebrands on copy)",
        ]}
      />
    </>
  );
}
