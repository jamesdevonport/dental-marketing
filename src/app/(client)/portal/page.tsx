import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Your ads" };

export default function PortalHomePage() {
  return (
    <ComingSoon
      title="Client portal home"
      description="The dental practice view. One big number: 'You got X new patient enquiries this month from ads.' Chart over time. Cost-per-enquiry. Top 3 ads as thumbnails."
      bullets={[
        "Hero: big number + agent-written narrative",
        "Simple chart (this month vs last month)",
        "Top 3 ads as thumbnails, clickable",
        "Branded in the practice's own colours — no Molar Marketing chrome",
      ]}
    />
  );
}
