import { Suspense } from "react";
import { AgentInbox } from "./agent-inbox";
import { agentProposals, creatives } from "@/lib/fixtures";

export const metadata = { title: "Agent" };

export default function AgentPage() {
  const awaitingCreatives = creatives.filter(
    (c) => c.approvalState === "awaiting_agency",
  );
  return (
    <Suspense>
      <AgentInbox
        proposals={agentProposals}
        awaitingCreatives={awaitingCreatives}
      />
    </Suspense>
  );
}
