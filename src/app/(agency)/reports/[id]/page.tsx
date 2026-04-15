import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { reports } from "@/lib/fixtures";

export const metadata = { title: "Report" };

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = reports.find((r) => r.id === id);
  if (!report) notFound();

  return (
    <>
      <PageHeader title={report.title} />
      <ComingSoon
        title="Report document view"
        description="Renders like a client-safe document — hero metrics, chart block, creative highlights (top 3 + worst 3), agent commentary, next-week recommendations, appendix with ad-level data. Presentation mode toggle strips chrome."
      />
    </>
  );
}
