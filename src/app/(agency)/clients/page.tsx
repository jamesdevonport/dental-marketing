import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionPills } from "@/components/common/connection-pills";
import { cn } from "@/lib/utils";
import {
  clients,
  clientSummary,
  creativesByClient,
  type Client,
} from "@/lib/fixtures";
import { dateShort, gbp, num } from "@/lib/format";

export const metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Dental practices on your book."
        actions={
          <Button size="sm" asChild>
            <Link href="/clients/new">
              <Plus className="h-3.5 w-3.5" /> New client
            </Link>
          </Button>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{clients.length}</span>{" "}
            client{clients.length === 1 ? "" : "s"} ·{" "}
            <span className="font-medium text-foreground">
              {clients.filter((c) => c.status === "active").length}
            </span>{" "}
            active ·{" "}
            <span className="font-medium text-foreground">
              {clients.filter((c) => c.status === "onboarding").length}
            </span>{" "}
            onboarding
          </span>
        </div>

        <Card className="p-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Connections</th>
                    <th className="px-3 py-2 font-medium">Approval</th>
                    <th className="px-3 py-2 font-medium text-right">Campaigns</th>
                    <th className="px-3 py-2 font-medium text-right">Creatives</th>
                    <th className="px-3 py-2 font-medium text-right">Spend 7d</th>
                    <th className="px-3 py-2 font-medium text-right">Leads 7d</th>
                    <th className="px-3 py-2 font-medium text-right">CPL</th>
                    <th className="px-3 py-2 font-medium">Added</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <ClientRow key={c.id} client={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ClientRow({ client }: { client: Client }) {
  const s = clientSummary(client.id);
  const creativeCount = (creativesByClient[client.id] ?? []).length;

  return (
    <tr className="group border-b last:border-b-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          href={`/clients/${client.id}/overview`}
          className="flex items-center gap-3"
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[11px] font-semibold text-white"
            style={{ backgroundColor: client.brand.primary }}
          >
            {client.logoInitials}
          </span>
          <div>
            <div className="font-medium">{client.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {client.city} · £{client.monthlyBudget.toLocaleString()}/mo budget
            </div>
          </div>
        </Link>
      </td>
      <td className="px-3 py-3">
        <ClientStatusPill status={client.status} />
      </td>
      <td className="px-3 py-3">
        <ConnectionPills connections={client.connections} />
      </td>
      <td className="px-3 py-3">
        <ApprovalModePill mode={client.approvalMode} />
      </td>
      <td className="px-3 py-3 text-right tabular-nums">{s.activeCampaigns}</td>
      <td className="px-3 py-3 text-right tabular-nums">{creativeCount}</td>
      <td className="px-3 py-3 text-right tabular-nums">{gbp(s.spend7d)}</td>
      <td className="px-3 py-3 text-right tabular-nums">{num(s.leads7d)}</td>
      <td className="px-3 py-3 text-right tabular-nums">
        {s.leads7d > 0 ? gbp(s.cpl, true) : "—"}
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {dateShort(client.createdAt)}
      </td>
      <td className="px-2 py-3 text-right">
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </td>
    </tr>
  );
}

function ClientStatusPill({ status }: { status: Client["status"] }) {
  const map: Record<Client["status"], string> = {
    active: "bg-success/15 text-success border-success/30",
    onboarding: "bg-warning/20 text-warning-foreground border-warning/40",
    paused: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium capitalize",
        map[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active"
            ? "bg-success"
            : status === "onboarding"
              ? "bg-warning"
              : "bg-muted-foreground/50",
        )}
      />
      {status}
    </span>
  );
}

function ApprovalModePill({ mode }: { mode: Client["approvalMode"] }) {
  const map: Record<Client["approvalMode"], { label: string; className: string }> = {
    auto: {
      label: "Auto",
      className: "bg-muted text-muted-foreground border-border",
    },
    approve_everything: {
      label: "Reviews all",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    report_only: {
      label: "Report-only",
      className: "bg-warning/15 text-warning-foreground border-warning/30",
    },
  };
  const s = map[mode];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}
