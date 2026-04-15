import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "New template" };

export default function NewTemplatePage() {
  return (
    <>
      <PageHeader
        title="Custom template"
        description="Advanced: build a new template with variable slots."
      />
      <ComingSoon
        phase={5}
        title="Custom template builder"
        description="For power users. Define variable slots (headline, body, image, CTA), layout, and example renders."
      />
    </>
  );
}
