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
              <h1 className="text-xl font-semibold tracking-tight">Creatives</h1>
              <p className="text-sm text-muted-foreground">
                Ad directory, templates, personas and topics — everything the
                matrix generator uses.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/creatives/new">
                <Plus className="h-3.5 w-3.5" />
                Generate creatives
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
