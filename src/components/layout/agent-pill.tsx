import Link from "next/link";
import { agentProposals } from "@/lib/fixtures";

export function AgentPill() {
  const pending = agentProposals.filter((p) => p.status === "pending").length;
  return (
    <Link
      href="/agent"
      className="flex h-8 items-center gap-2 rounded-full border bg-card px-3 text-xs hover:bg-accent"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="text-foreground">Agent active</span>
      {pending > 0 ? (
        <span className="text-muted-foreground">· {pending} proposals waiting</span>
      ) : null}
    </Link>
  );
}
