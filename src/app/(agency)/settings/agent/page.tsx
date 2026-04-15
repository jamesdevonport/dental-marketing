import { ComingSoon } from "@/components/layout/coming-soon";
import { scheduledTasks } from "@/lib/fixtures";

export const metadata = { title: "Agent config" };

export default function AgentSettingsPage() {
  return (
    <ComingSoon
      title="Agent configuration & guardrails"
      description={`Global approval mode default, per-action thresholds, scheduled tasks, and guardrails. ${scheduledTasks.length} scheduled tasks in fixtures.`}
      bullets={[
        "Approval mode: auto-approve routine / approve everything / report-only",
        "Per-action thresholds (sliders for spend, CTR, etc.)",
        "Guardrails: max daily spend change %, max ads paused per day, blackout windows",
        "Scheduled tasks with last-run + next-run status",
      ]}
    />
  );
}
