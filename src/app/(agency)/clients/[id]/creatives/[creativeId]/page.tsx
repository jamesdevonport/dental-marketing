import { notFound } from "next/navigation";
import { CreativeDetail } from "@/app/(agency)/creatives/[id]/creative-detail";
import { creativeById, leadFormsByClient } from "@/lib/fixtures";

export const metadata = { title: "Creative" };

export default async function ClientCreativeDetailPage({
  params,
}: {
  params: Promise<{ id: string; creativeId: string }>;
}) {
  const { id, creativeId } = await params;
  const creative = creativeById[creativeId];

  if (!creative || creative.clientId !== id) notFound();

  const forms = leadFormsByClient[id] ?? [];
  return <CreativeDetail creative={creative} leadForms={forms} />;
}
