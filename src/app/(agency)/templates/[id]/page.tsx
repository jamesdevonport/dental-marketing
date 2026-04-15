import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { templateById } from "@/lib/fixtures";

export const metadata = { title: "Template" };

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = templateById[id];
  if (!template) notFound();

  return (
    <>
      <PageHeader
        title={template.name}
        description={template.description}
      />
      <ComingSoon
        phase={5}
        title={`${template.name} template detail`}
        description={`Preview in all supported formats (${template.supportedFormats.join(", ")}), variable slots, example renders with three different brands.`}
      />
    </>
  );
}
