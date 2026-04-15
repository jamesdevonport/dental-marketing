import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tenant } from "@/lib/fixtures";
import { gbp, num } from "@/lib/format";

export const metadata = { title: "Billing" };

const INVOICES = [
  { id: "INV-2026-04", period: "April 2026", amount: 799, status: "Upcoming", date: "Apr 30" },
  { id: "INV-2026-03", period: "March 2026", amount: 799, status: "Paid", date: "Mar 30" },
  { id: "INV-2026-02", period: "February 2026", amount: 799, status: "Paid", date: "Feb 28" },
  { id: "INV-2026-01", period: "January 2026", amount: 799, status: "Paid", date: "Jan 31" },
];

export default function BillingSettingsPage() {
  const usedPct = (tenant.creditsUsed / tenant.creditsLimit) * 100;
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Current plan</div>
            <div className="text-xl font-semibold tracking-tight">{tenant.plan}</div>
            <div className="mt-1 text-sm text-muted-foreground">£799 / month · billed monthly · 10 client slots</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Downgrade</Button>
            <Button size="sm">Upgrade plan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Usage this month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Gemini image credits</span>
              <span className="tabular-nums">
                <span className="font-medium">{num(tenant.creditsUsed)}</span>{" "}
                / {num(tenant.creditsLimit)}
              </span>
            </div>
            <Progress value={usedPct} />
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {usedPct.toFixed(0)}% used · resets on the 1st
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <UsageStat label="Creatives generated" value={num(482)} />
            <UsageStat label="Meta API calls" value={num(14_201)} />
            <UsageStat label="Active client slots" value="4 / 10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-medium">Payment method</CardTitle>
            <p className="text-xs text-muted-foreground">Charged the 1st of every month.</p>
          </div>
          <Button size="sm" variant="outline">Update</Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Visa ending 4242</div>
              <div className="text-xs text-muted-foreground">Expires 09 / 2027</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-3 py-3">{inv.period}</td>
                  <td className="px-3 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium ${inv.status === "Paid" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{gbp(inv.amount)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="ghost" size="icon-sm" aria-label="Download invoice">
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
