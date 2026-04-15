import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Generate creatives" };

export default function NewCreativesPage() {
  return (
    <>
      <PageHeader
        title="Generate creatives"
        description="The matrix generator — the signature feature."
      />
      <ComingSoon
        phase={4}
        title="Matrix generator drawer"
        description="Pick formats × topics × personas × templates. Live count preview updates: '3 × 4 × 3 × 2 = 72 creatives'. [Preview 3 examples] sanity-checks a tiny sample before the big run. Generate all → live progress grid as thumbnails populate."
        bullets={[
          "Format / topic / persona / template multi-selects (filtered to client's active)",
          "Live count + estimated cost (generation + Gemini credits)",
          "Preview 3 examples before the big run",
          "Progress drawer: grid populates live with cancellable job",
        ]}
      />
    </>
  );
}
