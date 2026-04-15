import type { AgentProposal, AgentActivity, ScheduledTask } from "./types";

export const agentProposals: AgentProposal[] = [
  {
    id: "prop-001",
    clientId: "bright-smile",
    actionType: "pause",
    urgency: "high",
    headline:
      "Pause 4 whitening ads spending >£15 with 0 leads after 72 hours",
    reasoning:
      "Four creatives in 'Bright Smile — Whitening — Apr 2026' have each spent over £15 without producing a single lead over the last 72 hours. Pattern matches the fatigue profile for the testimonial template on feed placements. Recommend pausing and replacing with fresh variants generated from the matrix.",
    metrics: [
      { label: "Ads affected", value: "4" },
      { label: "Combined spend (72h)", value: "£73.20" },
      { label: "Leads (72h)", value: "0" },
      { label: "Avg CTR", value: "0.6%" },
      { label: "Benchmark CTR", value: "1.8%" },
    ],
    impactEstimate: "Saves ~£24/day in wasted spend",
    affectedCreativeIds: ["cr-0003", "cr-0007", "cr-0011", "cr-0015"],
    status: "pending",
    createdAt: "2026-04-15T08:12:00Z",
    thread: [
      {
        id: "m1",
        author: "agent",
        body: "I'd like to pause these — they match the fatigue signature from the Mayfair whitening refresh last month.",
        timestamp: "2026-04-15T08:12:00Z",
      },
    ],
  },
  {
    id: "prop-002",
    clientId: "mayfair-dental",
    actionType: "refresh-creative",
    urgency: "high",
    headline:
      "Refresh creatives for 'Mayfair — Veneers — Q2' — CTR down 38% WoW",
    reasoning:
      "Week-over-week CTR on the veneers campaign has dropped from 2.1% to 1.3% across all ad sets. Frequency is now 3.4, above the 3.0 fatigue threshold for premium audiences. Proposed: generate 8 new creatives (veneers × cosmetic-professional + high-income-cosmetic × testimonial + comparison templates) and swap them in gradually.",
    metrics: [
      { label: "CTR last week", value: "2.1%" },
      { label: "CTR this week", value: "1.3%" },
      { label: "WoW change", value: "-38%" },
      { label: "Frequency", value: "3.4" },
      { label: "Current creatives", value: "12" },
      { label: "Proposed new", value: "8" },
    ],
    impactEstimate: "Expected +24% CTR recovery over 7 days",
    affectedCreativeIds: ["cr-0021", "cr-0023", "cr-0027"],
    proposedCreativeIds: ["cr-0031", "cr-0033"],
    status: "pending",
    createdAt: "2026-04-15T09:07:00Z",
    thread: [
      {
        id: "m1",
        author: "agent",
        body: "Happy to pre-generate the new variants now so you can review before launch.",
        timestamp: "2026-04-15T09:07:00Z",
      },
    ],
  },
  {
    id: "prop-003",
    clientId: "northside-family",
    actionType: "budget-change",
    urgency: "medium",
    headline:
      "Increase 'Northside — Emergency — Always On' daily budget from £22 to £35",
    reasoning:
      "Emergency campaign is converting at £9.80 CPL — well under the £25 target. Currently budget-constrained: impression share lost to budget is 42%. Recommend a phased bump to £35/day and monitoring for 5 days.",
    metrics: [
      { label: "Current CPL", value: "£9.80" },
      { label: "Target CPL", value: "£25.00" },
      { label: "Impression share lost (budget)", value: "42%" },
      { label: "Proposed budget", value: "£35/day" },
      { label: "Current budget", value: "£22/day" },
    ],
    impactEstimate: "+~1.3 leads/day at similar CPL",
    affectedCreativeIds: [],
    status: "pending",
    createdAt: "2026-04-14T18:44:00Z",
    thread: [],
  },
  {
    id: "prop-004",
    clientId: "riverside-ortho",
    actionType: "launch",
    urgency: "medium",
    headline:
      "Launch 'Riverside — Invisalign Launch' campaign — all systems green",
    reasoning:
      "Onboarding checklist complete for Riverside Orthodontics. Pixel firing, Meta account connected, 8 creatives generated and approved. Ready to go live with the Invisalign launch campaign at £40/day CBO.",
    metrics: [
      { label: "Creatives ready", value: "8" },
      { label: "Pixel status", value: "Firing" },
      { label: "Meta connection", value: "Connected" },
      { label: "Proposed launch budget", value: "£40/day" },
    ],
    impactEstimate: "Expected 2–4 leads/day at £14–20 CPL",
    affectedCreativeIds: [],
    status: "pending",
    createdAt: "2026-04-14T15:20:00Z",
    thread: [],
  },
  {
    id: "prop-006",
    clientId: "mayfair-dental",
    actionType: "pause",
    urgency: "medium",
    headline: "Pause 2 underperforming implants ads at Mayfair",
    reasoning:
      "Two ads in 'Mayfair — Implants — Q2' have spent £41 combined over 5 days with 0 leads. Frequency above 2.8, CTR at 0.8%. Standard fatigue pattern. Recommend pausing and letting the Advantage+ audience rebalance.",
    metrics: [
      { label: "Ads affected", value: "2" },
      { label: "Combined spend (5d)", value: "£41.00" },
      { label: "Leads", value: "0" },
      { label: "CTR", value: "0.8%" },
    ],
    impactEstimate: "Saves ~£8/day",
    affectedCreativeIds: ["cr-0020", "cr-0025"],
    status: "pending",
    createdAt: "2026-04-13T14:15:00Z",
    thread: [],
  },
  {
    id: "prop-007",
    clientId: "northside-family",
    actionType: "refresh-creative",
    urgency: "low",
    headline: "Refresh children's checkup creatives — seasonal refresh",
    reasoning:
      "Term-time half term approaches (May). Current children's checkup creatives don't reference it. Recommend generating a small batch (6 creatives) with half-term-specific copy to run through May.",
    metrics: [
      { label: "Reason", value: "Seasonal timing" },
      { label: "Proposed batch", value: "6 creatives" },
      { label: "Run window", value: "Apr 28 – May 31" },
    ],
    impactEstimate: "Expected +15% engagement vs evergreen",
    affectedCreativeIds: [],
    status: "pending",
    createdAt: "2026-04-12T11:00:00Z",
    thread: [],
  },
];

export const agentActivity: AgentActivity[] = [
  {
    id: "act-001",
    timestamp: "2026-04-15T09:02:00Z",
    type: "insight-pull",
    summary: "Pulled Meta insights for all 4 clients (last 7 days)",
  },
  {
    id: "act-002",
    timestamp: "2026-04-15T09:07:00Z",
    type: "fatigue-flag",
    summary: "Flagged fatigue on Mayfair — Veneers — Q2 (CTR -38% WoW)",
    clientId: "mayfair-dental",
  },
  {
    id: "act-003",
    timestamp: "2026-04-15T08:12:00Z",
    type: "proposal",
    summary: "Proposed pausing 4 whitening ads for Bright Smile Dental",
    clientId: "bright-smile",
  },
  {
    id: "act-004",
    timestamp: "2026-04-14T16:32:00Z",
    type: "action",
    summary: "Refreshed 6 invisalign creatives for Bright Smile Dental",
    clientId: "bright-smile",
  },
  {
    id: "act-005",
    timestamp: "2026-04-14T16:40:00Z",
    type: "action",
    summary: "Paused 3 fatigued ads on Mayfair — Veneers — Q2",
    clientId: "mayfair-dental",
  },
  {
    id: "act-006",
    timestamp: "2026-04-14T14:00:00Z",
    type: "schedule-run",
    summary: "Creative refresh scan completed · 3 refreshes proposed",
  },
  {
    id: "act-007",
    timestamp: "2026-04-13T14:15:00Z",
    type: "proposal",
    summary: "Proposed pausing 2 underperforming implants ads at Mayfair",
    clientId: "mayfair-dental",
  },
];

export const scheduledTasks: ScheduledTask[] = [
  {
    id: "task-insights",
    name: "Daily performance check",
    cron: "Daily at 09:00",
    description:
      "Pulls Meta + Google insights across all clients and flags anomalies.",
    status: "active",
    lastRun: "2026-04-15T09:02:00Z",
    nextRun: "2026-04-16T09:00:00Z",
  },
  {
    id: "task-refresh-scan",
    name: "Creative refresh scan",
    cron: "Daily at 14:00",
    description:
      "Scans for fatigue signatures and proposes refreshes where needed.",
    status: "active",
    lastRun: "2026-04-14T14:00:00Z",
    nextRun: "2026-04-15T14:00:00Z",
  },
  {
    id: "task-budget-pacing",
    name: "Budget pacing check",
    cron: "Every 6 hours",
    description:
      "Checks pacing vs monthly budget. Proposes adjustments when over/underspending.",
    status: "paused",
    nextRun: "—",
  },
];
