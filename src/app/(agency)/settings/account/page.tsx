import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Account settings" };

export default function AccountSettingsPage() {
  return (
    <ComingSoon
      phase={5}
      title="Account settings"
      description="Name, email, password, two-factor authentication."
    />
  );
}
