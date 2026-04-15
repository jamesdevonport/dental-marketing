import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { clientById, reports } from "@/lib/fixtures";

export const metadata = { title: "Reports" };

export default async function ClientReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const clientReports = reports.filter((r) => r.clientId === id);

  return (
    <ComingSoon
      phase={5}
      title="Client-facing reports"
      description={`Past and draft reports for ${client.name}. ${clientReports.length} in fixtures (${clientReports.filter((r) => r.status === "draft").length} draft, ${clientReports.filter((r) => r.status === "sent").length} sent).`}
      bullets={[
        "List view: date, type, status, actions",
        "Report detail with hero metrics, charts, creative highlights, agent commentary",
        "Presentation mode toggle strips chrome",
        "PDF export + 'Send to client' action",
      ]}
    />
  );
}
