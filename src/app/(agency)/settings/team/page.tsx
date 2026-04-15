import { ComingSoon } from "@/components/layout/coming-soon";
import { team } from "@/lib/fixtures";

export const metadata = { title: "Team" };

export default function TeamSettingsPage() {
  return (
    <ComingSoon
      title="Team & roles"
      description={`${team.length} team members in fixtures. Invite by email, role picker (Owner / Admin / Editor / Viewer / Client), pending invites, audit log.`}
    />
  );
}
