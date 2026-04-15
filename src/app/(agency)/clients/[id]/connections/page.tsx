import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { clientById } from "@/lib/fixtures";

export const metadata = { title: "Connections" };

export default async function ClientConnectionsPage({
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
      title="Connection health"
      description={`Meta / Google Ads / Pixel / Pages status for ${client.name} with OAuth re-connect flows and pixel diagnostics. Fixture status: Meta ${client.connections.meta}, Google ${client.connections.google}, Pixel ${client.connections.pixel}.`}
      bullets={[
        "Meta App OAuth status + scopes in plain English",
        "Google Ads OAuth status + developer token state",
        "Pixel diagnostics with test-event flow + copy-paste snippet",
        "'Email to webmaster' shortcut for handoff",
      ]}
    />
  );
}
