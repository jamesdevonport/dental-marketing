import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "New template" };

export default function NewTemplatePage() {
  return (
    <ComingSoon
      title="Custom template builder"
      description="For power users. Define variable slots (headline, body, image, CTA), layout, and example renders."
    />
  );
}
