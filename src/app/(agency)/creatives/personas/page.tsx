import { ComingSoon } from "@/components/layout/coming-soon";
import { personas } from "@/lib/fixtures";

export const metadata = { title: "Personas" };

export default function PersonasPage() {
  return (
    <ComingSoon
      title="Editable persona library"
      description={`${personas.length} personas in fixtures. Editable table: Name / Description / Concerns / Tone adjustments / Example headline / Used by N clients. Cannot delete if in use.`}
    />
  );
}
