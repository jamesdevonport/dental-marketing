import { Suspense } from "react";
import { CreativesBrand } from "./creatives-brand";

export const metadata = { title: "Brand kits" };

export default function CreativesBrandPage() {
  return (
    <Suspense>
      <CreativesBrand />
    </Suspense>
  );
}
