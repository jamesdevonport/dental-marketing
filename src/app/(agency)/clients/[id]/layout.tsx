import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { clientById } from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { ClientTabs } from "./client-tabs";

export default async function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clientById[id];
  if (!client) notFound();

  return (
    <>
      <div className="flex flex-col gap-3 border-b bg-background px-4 pt-4 pb-0 md:px-6">
        <Breadcrumbs />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-md text-sm font-semibold text-white"
              style={{ backgroundColor: client.brand.primary }}
            >
              {client.logoInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
                <StatusPill status={client.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {client.city} · {client.serviceAreas.join(", ")}
              </p>
            </div>
          </div>
          <Link
            href={`/portal`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View as client →
          </Link>
        </div>
        <ClientTabs clientId={id} />
      </div>
      {children}
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    onboarding: "bg-warning/20 text-warning-foreground border-warning/40",
    paused: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium capitalize",
        map[status] ?? map.paused,
      )}
    >
      {status}
    </span>
  );
}
