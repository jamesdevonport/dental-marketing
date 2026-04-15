import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Performance" };

export default function PortalPerformancePage() {
  return (
    <ComingSoon
      phase={5}
      title="Performance (client view)"
      description="Simplified — no jargon. Two or three charts with a narrative summary written by the agent."
    />
  );
}
