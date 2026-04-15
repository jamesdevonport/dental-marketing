"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clients } from "@/lib/fixtures";

export function CreativesBrand() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Brand kits live on each client</CardTitle>
          <p className="text-sm text-muted-foreground">
            The shared library no longer owns brand editing. Open a client to
            manage its colours, typography, tone, and image library in context
            with that practice&apos;s campaigns and creatives.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {clients.map((client) => (
            <Button key={client.id} variant="outline" size="sm" asChild>
              <Link href={`/clients/${client.id}/brand`}>
                {client.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
