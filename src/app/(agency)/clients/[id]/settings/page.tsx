import { notFound } from "next/navigation";
import { ClientSettings } from "./client-settings";
import { clientById, leadFormsByClient } from "@/lib/fixtures";

export const metadata = { title: "Client settings" };

export default async function ClientSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const forms = leadFormsByClient[id] ?? [];
  return <ClientSettings client={client} leadForms={forms} />;
}
