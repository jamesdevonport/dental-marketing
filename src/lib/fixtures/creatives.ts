import type {
  ApprovalState,
  Client,
  Creative,
  CreativeCopy,
  CreativeDestination,
  CreativePerformance,
  CreativeStatus,
  CtaType,
  DestinationType,
  Format,
  MetaPublishConfig,
  PerformanceBand,
  Persona,
  TemplateId,
  Topic,
} from "./types";
import { clients } from "./clients";
import { templates } from "./templates";
import { topicById } from "./topics";
import { personaById } from "./personas";
import { leadFormsByClient } from "./lead-forms";

// ---- deterministic PRNG ----------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- matrix shape ----------------------------------------------------------
const FORMATS: Format[] = ["feed", "story", "link"];
const FORMAT_UNSUPPORTED: Record<TemplateId, Format[]> = {
  "event-promo": [],
  testimonial: [],
  community: ["link"],
  comparison: ["story"],
  "apple-notes": ["link"],
  imessage: ["link"],
};

// ---- copy variant generators -----------------------------------------------
// Each template contributes 3 headline hooks, 2 body hooks, 2 description hooks.
// The generator picks 2–3 headlines, 1–2 bodies, 1–2 descriptions per creative.
type CopyCtx = { topic: Topic; persona: Persona; city: string };

const HEADLINES: Record<TemplateId, (ctx: CopyCtx) => string[]> = {
  "event-promo": ({ topic, city }) => [
    `${topic.name} — £100 off this month`,
    `${topic.name} in ${city} · book this week`,
    `Limited slots for ${topic.name.toLowerCase()}`,
  ],
  testimonial: ({ topic, city }) => [
    `"Completely changed how I feel about my smile."`,
    `"I wish I'd done it sooner."`,
    `Why ${city} chooses us for ${topic.name.toLowerCase()}`,
  ],
  community: ({ topic, city }) => [
    `Your ${city} dentist`,
    `Trusted by families in ${city}`,
    `${topic.name} · local care, real results`,
  ],
  comparison: ({ topic }) => [
    `Before / After: ${topic.name}`,
    `Real patient results · ${topic.name}`,
    `${topic.name} that looks natural`,
  ],
  "apple-notes": ({ topic, persona }) => [
    `What to expect from ${topic.name.toLowerCase()}`,
    `${topic.name}: a quick checklist for ${persona.name.toLowerCase()}s`,
    `Is ${topic.name.toLowerCase()} right for you?`,
  ],
  imessage: ({ topic }) => [
    `"Is ${topic.name.toLowerCase()} worth it?"`,
    `"Should I book ${topic.name.toLowerCase()}?"`,
    `Patients ask us about ${topic.name.toLowerCase()}`,
  ],
};

const BODIES: Record<TemplateId, (ctx: CopyCtx) => string[]> = {
  "event-promo": ({ topic, city }) => [
    `${city} residents: book before the end of the month and save £100 on ${topic.name.toLowerCase()}.`,
    `Limited consultation slots for ${topic.name.toLowerCase()} in ${city}. First come, first served.`,
  ],
  testimonial: ({ topic, persona, city }) => [
    `${persona.name}s in ${city} are choosing us for ${topic.name.toLowerCase()}. Rated 4.9 on Google.`,
    `Real patient story. Real results. See why ${city} trusts us with their ${topic.name.toLowerCase()}.`,
  ],
  community: ({ topic, city }) => [
    `Family-run practice in ${city} with over 15 years of ${topic.name.toLowerCase()} expertise.`,
    `Trusted by 1,000+ patients across ${city}. New patients welcome.`,
  ],
  comparison: ({ topic, persona }) => [
    `${topic.name} tailored to ${persona.name.toLowerCase()}s who want a natural-looking finish.`,
    `Before and after on real patients. No filters, no stock photos.`,
  ],
  "apple-notes": ({ topic, persona }) => [
    `Two-minute read for ${persona.name.toLowerCase()}s considering ${topic.name.toLowerCase()}.`,
    `Everything you need to know about ${topic.name.toLowerCase()} — cost, timing, and results.`,
  ],
  imessage: ({ topic, persona, city }) => [
    `A conversation ${persona.name.toLowerCase()}s in ${city} are having with their dentist about ${topic.name.toLowerCase()}.`,
    `The three questions patients ask most about ${topic.name.toLowerCase()} — answered.`,
  ],
};

const DESCRIPTIONS: Record<TemplateId, (ctx: CopyCtx) => string[]> = {
  "event-promo": ({ city }) => [`Limited slots · ${city}`, `Book online · ${city}`],
  testimonial: () => [`Rated 4.9 on Google`, `Real patient stories`],
  community: ({ city }) => [`Local practice · ${city}`, `Patient-first · ${city}`],
  comparison: () => [`Real results · real people`, `No filters, no edits`],
  "apple-notes": () => [`2-minute read`, `Free consultation`],
  imessage: () => [`Real Q&A`, `Book in 30 seconds`],
};

function pickSubset<T>(pool: T[], min: number, max: number, rand: () => number): T[] {
  const count = Math.min(pool.length, min + Math.floor(rand() * (max - min + 1)));
  // Keep deterministic order — shuffle by assigning sort keys from rand.
  const scored = pool.map((item) => ({ item, key: rand() }));
  scored.sort((a, b) => a.key - b.key);
  return scored.slice(0, count).map((s) => s.item);
}

// ---- destination picker ----------------------------------------------------
const DEST_DISTRIBUTION: Record<string, Record<DestinationType, number>> = {
  "bright-smile":   { website: 0.6, phone_call: 0.3, lead_form: 0.1 },
  "mayfair-dental": { website: 0.4, phone_call: 0.05, lead_form: 0.55 },
  "northside-family": { website: 0.35, phone_call: 0.5, lead_form: 0.15 },
  "riverside-ortho": { website: 0.2, phone_call: 0.0, lead_form: 0.8 },
};

function pickDestinationType(clientId: string, rand: () => number): DestinationType {
  const dist = DEST_DISTRIBUTION[clientId] ?? { website: 1, lead_form: 0, phone_call: 0 };
  const r = rand();
  let sum = 0;
  for (const key of ["website", "lead_form", "phone_call"] as DestinationType[]) {
    sum += dist[key];
    if (r < sum) return key;
  }
  return "website";
}

function selectLeadFormId(client: Client, topicId: string, rand: () => number): {
  id: string;
  name: string;
} {
  const forms = leadFormsByClient[client.id]?.filter((f) => f.status === "published") ?? [];
  if (forms.length === 0) {
    // Fallback to the default
    const f = leadFormsByClient[client.id]?.[0];
    if (f) return { id: f.id, name: f.name };
    return { id: client.defaultLeadFormId ?? "lf-generic", name: "General enquiry" };
  }
  // Prefer form whose name hints at the topic
  const topic = topicById[topicId];
  const hint = topic?.name.toLowerCase().split(" ")[0] ?? "";
  const matched = forms.find((f) => f.name.toLowerCase().includes(hint));
  const picked = matched ?? forms[Math.floor(rand() * forms.length)];
  return { id: picked.id, name: picked.name };
}

function buildDestination(
  client: Client,
  topic: Topic,
  format: Format,
  creativeId: string,
  rand: () => number,
): CreativeDestination {
  const type = pickDestinationType(client.id, rand);

  if (type === "phone_call") {
    return {
      type: "phone_call",
      phoneNumber: client.ctaPhoneNumber ?? client.primaryContact.phone,
    };
  }

  if (type === "lead_form") {
    const { id, name } = selectLeadFormId(client, topic.id, rand);
    return { type: "lead_form", leadFormId: id, leadFormName: name };
  }

  // website
  const slug = topic.id;
  const urlBase = `${client.websiteUrl}/${slug}`;
  const pixelEvent =
    slug === "emergency" ? "Contact" : slug === "checkups" ? "Schedule" : "Lead";
  return {
    type: "website",
    url: urlBase,
    displayUrl: client.websiteUrl.replace(/^https?:\/\//, ""),
    utm: {
      source: "meta",
      medium: "paid_social",
      campaign: `${slug}-${format}`,
      content: creativeId,
    },
    pixelEventId: pixelEvent,
  };
}

// ---- CTA selection ---------------------------------------------------------
function selectCta(
  destination: CreativeDestination,
  templateId: TemplateId,
  rand: () => number,
): CtaType {
  if (destination.type === "phone_call") return "CALL_NOW";
  if (destination.type === "lead_form") {
    return rand() < 0.5 ? "SIGN_UP" : "REQUEST_TIME";
  }
  // website
  if (templateId === "event-promo") return "BOOK_NOW";
  if (templateId === "testimonial" || templateId === "imessage") {
    return "LEARN_MORE";
  }
  return rand() < 0.6 ? "BOOK_NOW" : "LEARN_MORE";
}

// ---- Meta publish config ---------------------------------------------------
function buildPublishConfig(format: Format, rand: () => number): MetaPublishConfig {
  const placements =
    format === "story" ? "stories_reels" : format === "feed" ? "feed" : "both";
  return {
    placements,
    useDynamicCreative: rand() < 0.7,
    advantagePlus: {
      standardEnhancements: true,
      textGeneration: rand() < 0.6,
      textOptimizations: true,
    },
  };
}

// ---- status + approval state derivation ------------------------------------
function deriveApprovalState(
  client: Client,
  status: CreativeStatus,
  rand: () => number,
): ApprovalState {
  if (status === "live" || status === "paused") return "approved";
  if (status === "archived") return rand() < 0.15 ? "rejected" : "approved";
  // draft
  if (client.approvalMode !== "approve_everything") return "not_required";
  const r = rand();
  if (r < 0.4) return "awaiting_agency";
  if (r < 0.65 && client.clientApprovalRequired) return "awaiting_client";
  if (r < 0.9) return "approved";
  return "rejected";
}

function rollStatus(client: Client, rand: () => number): CreativeStatus {
  if (client.status === "onboarding") {
    return rand() < 0.7 ? "draft" : "paused";
  }
  // report_only clients never go live — bias to draft/paused
  if (client.approvalMode === "report_only") {
    return rand() < 0.6 ? "draft" : "paused";
  }
  const r = rand();
  if (r < 0.6) return "live";
  if (r < 0.75) return "paused";
  if (r < 0.9) return "draft";
  return "archived";
}

// ---- performance synthesis -------------------------------------------------
function generatePerformance(
  rand: () => number,
  status: CreativeStatus,
): { perf?: CreativePerformance; band: PerformanceBand } {
  if (status === "draft" || status === "archived") {
    return { band: "untested" };
  }
  const impressions = Math.floor(800 + rand() * 28000);
  const ctr = 0.8 + rand() * 3.5;
  const clicks = Math.floor((impressions * ctr) / 100);
  const leadRate = 0.02 + rand() * 0.07;
  const leads = Math.max(0, Math.floor(clicks * leadRate));
  const spend = Math.round((impressions / 1000) * (4 + rand() * 10) * 100) / 100;
  const cpl = leads > 0 ? Math.round((spend / leads) * 100) / 100 : spend;
  const cpm = Math.round((spend / (impressions / 1000)) * 100) / 100;
  const frequency = Math.round((1 + rand() * 2.5) * 100) / 100;

  let band: PerformanceBand;
  if (leads === 0 && spend > 20) band = "poor";
  else if (cpl < 12) band = "top";
  else if (cpl < 20) band = "good";
  else if (cpl < 32) band = "ok";
  else band = "poor";

  return {
    perf: { impressions, clicks, spend, leads, ctr, cpl, cpm, frequency },
    band,
  };
}

// ---- date helper -----------------------------------------------------------
function generatedAtFor(rand: () => number): string {
  const daysAgo = Math.floor(rand() * 42);
  const d = new Date("2026-04-15T10:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

// ---- main builder ----------------------------------------------------------
function buildCreatives(): Creative[] {
  const out: Creative[] = [];
  let counter = 0;

  for (const client of clients) {
    const seed = [...client.id].reduce((n, c) => n + c.charCodeAt(0), 0) * 9181;
    const rand = mulberry32(seed);

    // Full combo matrix for this client's active topics × personas × templates × formats
    const combos: {
      templateId: TemplateId;
      topicId: string;
      personaId: string;
      format: Format;
    }[] = [];
    for (const template of templates) {
      for (const topicId of client.topicIds) {
        for (const personaId of client.personaIds) {
          for (const format of FORMATS) {
            if (FORMAT_UNSUPPORTED[template.id].includes(format)) continue;
            combos.push({
              templateId: template.id,
              topicId,
              personaId,
              format,
            });
          }
        }
      }
    }

    const shuffled = combos
      .map((c) => ({ c, r: rand() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.c);

    const take = client.status === "onboarding" ? 8 : 16;
    const selected = shuffled.slice(0, take);

    for (const combo of selected) {
      counter++;
      const id = `cr-${counter.toString().padStart(4, "0")}`;
      const topic = topicById[combo.topicId];
      const persona = personaById[combo.personaId];
      const ctx: CopyCtx = { topic, persona, city: client.city };

      const headlines = pickSubset(HEADLINES[combo.templateId](ctx), 2, 3, rand);
      const bodies = pickSubset(BODIES[combo.templateId](ctx), 1, 2, rand);
      const descriptions = pickSubset(DESCRIPTIONS[combo.templateId](ctx), 1, 2, rand);

      const destination = buildDestination(client, topic, combo.format, id, rand);
      const ctaType = selectCta(destination, combo.templateId, rand);

      const copy: CreativeCopy = { headlines, bodies, descriptions, ctaType };

      const status = rollStatus(client, rand);
      const approvalState = deriveApprovalState(client, status, rand);
      const { perf, band } = generatePerformance(rand, status);

      const generatedBy: Creative["generatedBy"] =
        rand() < 0.1
          ? "agent"
          : rand() < 0.2
            ? "ai-refresh"
            : rand() < 0.1
              ? "manual"
              : "matrix";

      out.push({
        id,
        clientId: client.id,
        name: `${topic.name} · ${persona.name} · ${combo.format}`,
        templateId: combo.templateId,
        topicId: combo.topicId,
        personaId: combo.personaId,
        format: combo.format,
        copy,
        destination,
        publish: buildPublishConfig(combo.format, rand),
        status,
        approvalState,
        generatedBy,
        generatedAt: generatedAtFor(rand),
        performance: perf,
        performanceBand: band,
        campaignIds: [],
      });
    }
  }

  return out;
}

export const creatives: Creative[] = buildCreatives();

export const creativesByClient: Record<string, Creative[]> = clients.reduce(
  (acc, c) => {
    acc[c.id] = creatives.filter((cr) => cr.clientId === c.id);
    return acc;
  },
  {} as Record<string, Creative[]>,
);

export const creativeById = Object.fromEntries(creatives.map((c) => [c.id, c]));
