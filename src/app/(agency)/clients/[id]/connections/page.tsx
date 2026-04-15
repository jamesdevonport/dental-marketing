import { notFound } from "next/navigation";
import { ClientConnections } from "./client-connections";
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

  return <ClientConnections client={client} />;
}
