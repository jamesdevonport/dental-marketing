export type ID = string;

export type Format = "feed" | "story" | "link";

export type ConnectionStatus = "connected" | "degraded" | "missing";

export type ClientStatus = "active" | "onboarding" | "paused";

export type Tone = "warm" | "premium" | "clinical" | "fun";

export type TemplateId =
  | "event-promo"
  | "testimonial"
  | "community"
  | "comparison"
  | "apple-notes"
  | "imessage";

export type Urgency = "high" | "medium" | "low";

export type PerformanceBand = "top" | "good" | "ok" | "poor" | "untested";

export type BrandKit = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  fontPrimary: string;
  fontSecondary: string;
  tone: Tone;
};

export type Client = {
  id: ID;
  name: string;
  tradingName?: string;
  city: string;
  postcode: string;
  serviceAreas: string[];
  websiteUrl: string;
  status: ClientStatus;
  logoInitials: string;
  brand: BrandKit;
  topicIds: ID[];
  personaIds: ID[];
  connections: {
    meta: ConnectionStatus;
    google: ConnectionStatus;
    pixel: ConnectionStatus;
  };
  monthlyBudget: number;
  primaryContact: { name: string; email: string; phone: string };
  createdAt: string;
};

export type Topic = {
  id: ID;
  name: string;
  description: string;
  priceRange: "budget" | "mid" | "premium";
};

export type Persona = {
  id: ID;
  name: string;
  description: string;
  concerns: string[];
  toneAdjustments: string;
};

export type Template = {
  id: TemplateId;
  name: string;
  description: string;
  supportedFormats: Format[];
};

export type CreativePerformance = {
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  ctr: number;
  cpl: number;
  cpm: number;
  frequency: number;
};

export type Creative = {
  id: ID;
  clientId: ID;
  templateId: TemplateId;
  topicId: ID;
  personaId: ID;
  format: Format;
  headline: string;
  body: string;
  description?: string;
  cta: string;
  destinationUrl: string;
  status: "draft" | "live" | "paused" | "archived";
  generatedBy: "matrix" | "manual" | "ai-refresh" | "agent";
  generatedAt: string;
  performance?: CreativePerformance;
  performanceBand: PerformanceBand;
  campaignId?: ID;
};

export type AdSet = {
  id: ID;
  campaignId: ID;
  name: string;
  dailyBudget: number;
  status: "active" | "paused";
  placements: "feed" | "stories-reels" | "both";
  audienceType: "advantage-plus" | "custom" | "lookalike" | "retargeting";
  ageMin: number;
  ageMax: number;
  creativeIds: ID[];
};

export type Campaign = {
  id: ID;
  clientId: ID;
  platform: "meta" | "google";
  name: string;
  status: "active" | "paused" | "draft";
  objective: "leads" | "conversions" | "traffic" | "awareness";
  budgetStrategy: "cbo" | "adset";
  dailyBudget: number;
  spend7d: number;
  leads7d: number;
  cpl: number;
  ctr: number;
  updatedAt: string;
  adSets: AdSet[];
};

export type ThreadMessage = {
  id: ID;
  author: "agent" | "user";
  body: string;
  timestamp: string;
};

export type AgentProposal = {
  id: ID;
  clientId: ID;
  actionType: "pause" | "launch" | "refresh-creative" | "budget-change" | "report";
  urgency: Urgency;
  headline: string;
  reasoning: string;
  metrics: { label: string; value: string }[];
  impactEstimate?: string;
  affectedCreativeIds: ID[];
  proposedCreativeIds?: ID[];
  status: "pending" | "approved" | "rejected" | "deferred";
  createdAt: string;
  thread: ThreadMessage[];
};

export type AgentActivity = {
  id: ID;
  timestamp: string;
  type:
    | "insight-pull"
    | "fatigue-flag"
    | "report-draft"
    | "proposal"
    | "action"
    | "schedule-run";
  summary: string;
  clientId?: ID;
};

export type ScheduledTask = {
  id: ID;
  name: string;
  cron: string;
  description: string;
  status: "active" | "paused";
  lastRun?: string;
  nextRun: string;
};

export type TeamMember = {
  id: ID;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer" | "client";
  avatarInitials: string;
};

export type Report = {
  id: ID;
  clientId: ID | "all";
  type: "daily" | "weekly" | "monthly" | "custom";
  dateRange: { start: string; end: string };
  generatedBy: "agent" | "user";
  status: "draft" | "sent" | "viewed";
  generatedAt: string;
  title: string;
};

export type Tenant = {
  id: ID;
  name: string;
  plan: string;
  creditsUsed: number;
  creditsLimit: number;
};
