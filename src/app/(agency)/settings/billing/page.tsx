import { ComingSoon } from "@/components/layout/coming-soon";
import { tenant } from "@/lib/fixtures";

export const metadata = { title: "Billing" };

export default function BillingSettingsPage() {
  return (
    <ComingSoon
      phase={5}
      title="Billing & usage"
      description={`Current plan (${tenant.plan}), seats, usage meters (${tenant.creditsUsed.toLocaleString()} / ${tenant.creditsLimit.toLocaleString()} credits used), upcoming invoice, past invoices, payment method.`}
    />
  );
}
