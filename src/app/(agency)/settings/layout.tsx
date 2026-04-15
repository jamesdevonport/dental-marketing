import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b bg-background px-4 pt-4 pb-0 md:px-6">
        <div className="space-y-3">
          <Breadcrumbs />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Account, team, billing, integrations, agent config, and more.
            </p>
          </div>
          <SettingsNav />
        </div>
      </div>
      {children}
    </>
  );
}
