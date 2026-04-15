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

export type CtaType =
  | "LEARN_MORE"
  | "BOOK_NOW"
  | "CALL_NOW"
  | "SIGN_UP"
  | "REQUEST_TIME"
  | "CONTACT_US";

export type ApprovalMode = "auto" | "approve_everything" | "report_only";

export type ApprovalState =
  | "not_required"
  | "awaiting_agency"
  | "awaiting_client"
  | "approved"
  | "rejected";

export type CreativeStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "live"
  | "paused"
  | "archived";

export type DestinationType = "website" | "lead_form" | "phone_call";

export type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
};

export type CreativeDestination =
  | {
      type: "website";
      url: string;
      displayUrl?: string;
      utm: UtmParams;
      pixelEventId?: string;
    }
  | {
      type: "lead_form";
      leadFormId: ID;
      leadFormName: string;
    }
  | {
      type: "phone_call";
      phoneNumber: string;
    };

export type CreativeCopy = {
  headlines: string[];
  bodies: string[];
  descriptions: string[];
  ctaType: CtaType;
};

export type MetaPublishConfig = {
  placements: "feed" | "stories_reels" | "both";
  useDynamicCreative: boolean;
  advantagePlus: {
    standardEnhancements: boolean;
    textGeneration: boolean;
    textOptimizations: boolean;
  };
};

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
  /** Agent approval policy — drives where new creatives route for review. */
  approvalMode: ApprovalMode;
  /** When true, creatives must also be approved by the practice after agency sign-off. */
  clientApprovalRequired: boolean;
  /** Preferred lead form for topics without a specific form defined. */
  defaultLeadFormId?: ID;
  /** Phone number used by click-to-call creatives. */
  ctaPhoneNumber?: string;
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
  name: string;
  templateId: TemplateId;
  topicId: ID;
  personaId: ID;
  format: Format;
  copy: CreativeCopy;
  destination: CreativeDestination;
  publish: MetaPublishConfig;
  /** CDN URL for a rendered PNG, if any. Procedural thumbs leave this undefined. */
  imageUrl?: string;
  status: CreativeStatus;
  approvalState: ApprovalState;
  generatedBy: "matrix" | "manual" | "ai-refresh" | "agent";
  generatedAt: string;
  /** Campaigns this creative has been attached to (can be multiple). */
  campaignIds: ID[];
  performance?: CreativePerformance;
  performanceBand: PerformanceBand;
};

export type LeadForm = {
  id: ID;
  clientId: ID;
  name: string;
  fields: Array<
    | "email"
    | "phone"
    | "full_name"
    | "preferred_time"
    | "service_interest"
  >;
  thankYouMessage: string;
  status: "draft" | "published";
  createdAt: string;
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
  author: "agent" | "user" | "client";
  body: string;
  timestamp: string;
};

export type AgentProposal = {
  id: ID;
  clientId: ID;
  actionType:
    | "pause"
    | "launch"
    | "refresh-creative"
    | "budget-change"
    | "report"
    | "creative-review";
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
