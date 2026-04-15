import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Integrations" };

export default function IntegrationsSettingsPage() {
  return (
    <ComingSoon
      title="Platform integrations"
      description="Meta App review status, Google Ads developer token, Gemini API key, Slack/WhatsApp delivery, Convex backups, webhook endpoints."
      bullets={[
        "Meta App status (In development / In review / Live) + test/live toggle",
        "OAuth connections listed per client",
        "Gemini API key + monthly usage meter",
        "Slack workspace + default channel with per-client override",
      ]}
    />
  );
}
