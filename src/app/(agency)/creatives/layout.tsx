import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { CreativesNav } from "./creatives-nav";

export default function CreativesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b bg-background px-4 pt-4 pb-0 md:px-6">
        <div className="space-y-3">
          <Breadcrumbs />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Library</h1>
              <p className="text-sm text-muted-foreground">
                Shared creative system assets and a cross-client review view.
                Client-specific brand, campaign, and creative work lives inside
                each client workspace.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/creatives?matrix=open">
                <Plus className="h-3.5 w-3.5" />
                Generate batch
              </Link>
            </Button>
          </div>
          <CreativesNav />
        </div>
      </div>
      {children}
    </>
  );
}
