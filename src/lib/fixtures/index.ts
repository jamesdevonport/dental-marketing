export * from "./types";
export * from "./tenant";
export * from "./clients";
export * from "./topics";
export * from "./personas";
export * from "./templates";
export * from "./creatives";
export * from "./lead-forms";
export * from "./campaigns";
export * from "./agent";

import { clients } from "./clients";
import { creatives } from "./creatives";
import { campaigns } from "./campaigns";
import { agentProposals } from "./agent";

// Convenience aggregates for the dashboard.
export function aggregateLast7Days() {
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend7d,
      leads: acc.leads + c.leads7d,
    }),
    { spend: 0, leads: 0 },
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const cpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
  return {
    spend: Math.round(totals.spend * 100) / 100,
    leads: totals.leads,
    cpl: Math.round(cpl * 100) / 100,
    activeCampaigns,
    clients: clients.length,
    creatives: creatives.length,
    pendingProposals: agentProposals.filter((p) => p.status === "pending").length,
  };
}

export function clientSummary(clientId: string) {
  const clientCampaigns = campaigns.filter((c) => c.clientId === clientId);
  const spend7d = clientCampaigns.reduce((s, c) => s + c.spend7d, 0);
  const leads7d = clientCampaigns.reduce((s, c) => s + c.leads7d, 0);
  const cpl = leads7d > 0 ? spend7d / leads7d : 0;
  return {
    spend7d: Math.round(spend7d * 100) / 100,
    leads7d,
    cpl: Math.round(cpl * 100) / 100,
    activeCampaigns: clientCampaigns.filter((c) => c.status === "active").length,
  };
}
