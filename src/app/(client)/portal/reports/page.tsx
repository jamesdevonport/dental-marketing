import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Reports" };

export default function PortalReportsPage() {
  return (
    <ComingSoon
      title="Past reports (client view)"
      description="Archive of previous monthly / weekly reports. Read-only. PDF export."
    />
  );
}
