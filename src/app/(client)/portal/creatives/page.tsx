import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Your live ads" };

export default function PortalCreativesPage() {
  return (
    <ComingSoon
      title="Live creatives (client view)"
      description="Read-only grid of the ads currently running. No editing, no metrics jargon. Click a tile to see plain-English context."
    />
  );
}
