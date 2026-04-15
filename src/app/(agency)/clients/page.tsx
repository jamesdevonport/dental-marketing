import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Dental practices on your book."
        actions={
          <Button asChild size="sm">
            <Link href="/clients/new">+ New client</Link>
          </Button>
        }
      />
      <ComingSoon
        phase={3}
        title="Clients list with grid / list toggle"
        description="Four example clients (Bright Smile, Mayfair, Northside, Riverside) are already in fixtures — this page will render them as cards with connection health icons, 7-day spend + leads, and a status pill."
        bullets={[
          "Grid / list toggle",
          "Filters: status, connection health, region",
          "Connection health icons per card (Meta / Google / Pixel)",
          "Empty state with onboarding CTA",
        ]}
      />
    </>
  );
}
