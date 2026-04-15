import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Agent" };

export default function AgentPage() {
  return (
    <>
      <PageHeader
        title="Agent"
        description="Pending proposals, scheduled tasks, and activity from the autonomous agent."
      />
      <ComingSoon
        title="Agent approval inbox"
        description="The agent inbox lives here: a split-pane view with pending proposals on the left and the full reasoning + preview + action bar on the right. Fixtures for 7 live proposals already exist."
        bullets={[
          "Tabs: Pending / Approved / Rejected / All activity",
          "Proposal detail with metrics, impact estimate, and Slack-style thread",
          "Approve / Reject / Defer / Approve with edits",
          "Scheduled tasks rail at the bottom",
        ]}
      />
    </>
  );
}
