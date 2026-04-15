import { Suspense } from "react";
import { AdDirectoryGrid } from "@/components/creative/ad-directory-grid";
import { creatives } from "@/lib/fixtures";

export const metadata = { title: "All creatives" };

export default function CrossClientCreativesPage() {
  return (
    <div className="space-y-4">
      <div className="px-4 pt-4 text-sm text-muted-foreground md:px-6">
        Cross-client review queue. Use a client workspace for brand edits,
        campaign setup, and day-to-day creative management on a single practice.
      </div>
      <Suspense>
        <AdDirectoryGrid creatives={creatives} scope={{ kind: "cross-client" }} />
      </Suspense>
    </div>
  );
}
