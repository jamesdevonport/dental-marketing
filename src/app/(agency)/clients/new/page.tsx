import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Onboard a new client"
        description="An 8-step wizard to get a dental practice from zero to launch-ready."
      />
      <ComingSoon
        phase={3}
        title="Client onboarding wizard (8 steps)"
        description="Step-by-step: basics → brand kit → services/topics → audience/personas → budget/goals → connect accounts → agent preferences → review & launch."
        bullets={[
          "Step 1: practice basics with 'Auto-fill from website' that pre-populates later steps",
          "Step 2: brand kit (logo upload, palette, fonts, photography)",
          "Step 5: budget with auto-split suggestion between Meta and Google",
          "Step 8: generates 36 starter creatives from the matrix",
        ]}
      />
    </>
  );
}
