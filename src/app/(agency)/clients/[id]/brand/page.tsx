import { notFound } from "next/navigation";
import { ClientBrand } from "./client-brand";
import { clientById } from "@/lib/fixtures";

export const metadata = { title: "Brand" };

export default async function ClientBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();
  return <ClientBrand client={client} />;
}
