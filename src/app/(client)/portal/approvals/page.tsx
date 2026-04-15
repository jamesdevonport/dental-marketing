import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Approvals" };

export default function PortalApprovalsPage() {
  return (
    <ComingSoon
      title="Pending approvals (client view)"
      description="Anything requiring client sign-off. One big card per item: preview + [Approve] / [Request changes]."
    />
  );
}
