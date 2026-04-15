import { Suspense } from "react";
import { AdDirectoryGrid } from "@/components/creative/ad-directory-grid";
import { creatives } from "@/lib/fixtures";

export const metadata = { title: "Ad directory" };

export default function CrossClientCreativesPage() {
  return (
    <Suspense>
      <AdDirectoryGrid creatives={creatives} scope={{ kind: "cross-client" }} />
    </Suspense>
  );
}
