import { notFound } from "next/navigation";
import { AdDirectoryGrid } from "@/components/creative/ad-directory-grid";
import { clientById, creativesByClient } from "@/lib/fixtures";

export const metadata = { title: "Creatives" };

export default async function ClientCreativesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  const list = creativesByClient[id] ?? [];

  return (
    <AdDirectoryGrid creatives={list} scope={{ kind: "client", clientId: id }} />
  );
}
