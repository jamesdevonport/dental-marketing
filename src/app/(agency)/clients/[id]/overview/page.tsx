import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { clientById, clientSummary } from "@/lib/fixtures";

export const metadata = { title: "Overview" };

export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const summary = clientSummary(id);

  return (
    <ComingSoon
      phase={3}
      title="Client overview dashboard"
      description={`KPI strip, 30-day spend+leads chart, funnel, active creatives strip, recent agent activity, and connection health for ${client.name}. Current fixtures show £${summary.spend7d.toFixed(0)} spend and ${summary.leads7d} leads over the last 7 days.`}
      bullets={[
        "KPI strip: Spend MTD, Leads MTD, CPL, ROAS proxy",
        "Line chart: spend + leads over 30 days, dual axis",
        "Funnel: Impressions → Clicks → Leads → Appointments",
        "Active creatives (thumbnail strip, clickable)",
        "Recent agent activity (last 5 events)",
      ]}
    />
  );
}
