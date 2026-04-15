import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { reports } from "@/lib/fixtures";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Agency-level reporting."
      />
      <ComingSoon
        phase={5}
        title="Reports list"
        description={`${reports.length} reports in fixtures. List view: date, type (Daily / Weekly / Monthly / Custom), clients covered, generated-by (agent / manual), status, actions.`}
        bullets={[
          "Filter by client, date range, type, status",
          "Actions: View / Download PDF / Send to client",
          "Agent-generated vs user-drafted distinction",
        ]}
      />
    </>
  );
}
