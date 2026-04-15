import { PortalApprovals } from "./portal-approvals";
import { creativesByClient } from "@/lib/fixtures";
import { CURRENT_PORTAL_CLIENT_ID } from "@/lib/portal";

export const metadata = { title: "Approvals" };

export default function PortalApprovalsPage() {
  const awaiting = (creativesByClient[CURRENT_PORTAL_CLIENT_ID] ?? []).filter(
    (c) => c.approvalState === "awaiting_client",
  );
  return <PortalApprovals creatives={awaiting} />;
}
