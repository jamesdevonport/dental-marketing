import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { clientById } from "@/lib/fixtures";

export const metadata = { title: "Client settings" };

export default async function ClientSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();

  return (
    <ComingSoon
      phase={3}
      title="Per-client settings"
      description={`Budgets, approval rules, contacts, and notification preferences for ${client.name}. Monthly budget fixture: £${client.monthlyBudget.toLocaleString()}.`}
      bullets={[
        "Monthly budget with auto Meta/Google split",
        "Approval mode: auto / approve-everything / report-only",
        "Contacts and Slack/WhatsApp channel for delivery",
        "Quiet hours",
      ]}
    />
  );
}
