import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Notifications" };

export default function NotificationsSettingsPage() {
  return (
    <ComingSoon
      phase={5}
      title="Notification routing"
      description="Matrix of event × channel (Slack / WhatsApp / Email / In-app) with on/off toggles."
    />
  );
}
