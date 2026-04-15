import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { templates } from "@/lib/fixtures";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="The creative template library."
      />
      <ComingSoon
        phase={5}
        title="Template library"
        description={`${templates.length} templates in fixtures: ${templates.map((t) => t.name).join(", ")}. Grid of cards with preview thumbnails and supported-format chips.`}
        bullets={[
          "Grid cards with preview + supported format chips (Feed / Story / Link)",
          "Template detail: variable slots + example renders across three brands",
          "'Request a new template' CTA",
        ]}
      />
    </>
  );
}
