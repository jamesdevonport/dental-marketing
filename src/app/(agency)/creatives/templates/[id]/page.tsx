import { notFound } from "next/navigation";
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
      <div className="border-b bg-background px-4 py-3 md:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{template.name}</h2>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>
      <ComingSoon
        title={`${template.name} template detail`}
        description={`Preview in all supported formats (${template.supportedFormats.join(", ")}), variable slots, example renders with three different brands.`}
      />
    </>
  );
}
