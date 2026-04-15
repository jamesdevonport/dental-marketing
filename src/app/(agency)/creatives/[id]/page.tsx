import { notFound } from "next/navigation";
import { CreativeDetail } from "./creative-detail";
import { creativeById, leadFormsByClient } from "@/lib/fixtures";

export const metadata = { title: "Creative" };

export default async function CreativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creative = creativeById[id];
  if (!creative) notFound();
  const forms = leadFormsByClient[creative.clientId] ?? [];

  return <CreativeDetail creative={creative} leadForms={forms} />;
}
