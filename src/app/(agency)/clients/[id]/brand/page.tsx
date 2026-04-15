import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
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

  return (
    <ComingSoon
      phase={3}
      title="Brand kit editor with live preview"
      description={`Edit ${client.name}'s logo, palette, fonts, tone, and photography. Side panel shows a live-rendered ad in the Feed format that updates in real time as colours change — this is the 'money shot' of the product.`}
      bullets={[
        "Palette: primary / secondary / accent / background / text (with 'Extract from logo')",
        "Fonts: Google Fonts picker + upload custom",
        "Tone of voice dropdown with 'suggest from website' AI helper",
        "Photography library with categories + consent toggle",
        "Version history (restore previous brand kit)",
      ]}
    />
  );
}
