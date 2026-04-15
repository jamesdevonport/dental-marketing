import type {
  Creative,
  CreativePerformance,
  Format,
  PerformanceBand,
  TemplateId,
} from "./types";
import { clients } from "./clients";
import { templates } from "./templates";
import { topicById } from "./topics";
import { personaById } from "./personas";

// Deterministic pseudo-random — stable output across rebuilds without pulling in a dep.
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

const FORMATS: Format[] = ["feed", "story", "link"];
const FORMAT_UNSUPPORTED: Record<TemplateId, Format[]> = {
  "event-promo": [],
  testimonial: [],
  community: ["link"],
  comparison: ["story"],
  "apple-notes": ["link"],
  imessage: ["link"],
};

const CTAS = [
  "Book Now",
  "Learn More",
  "Get Quote",
  "Call Now",
  "Book Consultation",
];

type CopyBlock = { headline: string; body: string; description: string };

function copyFor(
  templateId: TemplateId,
  topicName: string,
  personaName: string,
  clientCity: string,
): CopyBlock {
  switch (templateId) {
    case "event-promo":
      return {
        headline: `${topicName} — £100 off this month`,
        body: `${clientCity} residents: book a ${topicName.toLowerCase()} consultation before the end of the month and save £100.`,
        description: `Limited slots · ${clientCity}`,
      };
    case "testimonial":
      return {
        headline: `"Completely changed how I feel about my smile."`,
        body: `${personaName}s in ${clientCity} are choosing us for ${topicName.toLowerCase()} — see why.`,
        description: `Rated 4.9 on Google`,
      };
    case "community":
      return {
        headline: `Your ${clientCity} dentist`,
        body: `Trusted by families across ${clientCity} for ${topicName.toLowerCase()} and routine care.`,
        description: `Local practice · Patient-first`,
      };
    case "comparison":
      return {
        headline: `Before / After: ${topicName}`,
        body: `Real patient results. ${topicName} tailored to ${personaName.toLowerCase()}s who want natural-looking outcomes.`,
        description: `Real results · Real people`,
      };
    case "apple-notes":
      return {
        headline: `What to expect from ${topicName}`,
        body: `A quick checklist for ${personaName.toLowerCase()}s considering ${topicName.toLowerCase()} in ${clientCity}.`,
        description: `2-minute read`,
      };
    case "imessage":
      return {
        headline: `"Is ${topicName.toLowerCase()} worth it?"`,
        body: `A conversation ${personaName.toLowerCase()}s in ${clientCity} are having with their dentist about ${topicName.toLowerCase()}.`,
        description: `Real Q&A`,
      };
  }
}

function generatePerformance(
  rand: () => number,
  status: Creative["status"],
): { perf: CreativePerformance | undefined; band: PerformanceBand } {
  if (status === "draft" || status === "archived") {
    return { perf: undefined, band: "untested" };
  }
  const impressions = Math.floor(800 + rand() * 28000);
  const ctr = 0.8 + rand() * 3.5; // percent
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

function generatedAtFor(rand: () => number): string {
  const daysAgo = Math.floor(rand() * 42);
  const d = new Date("2026-04-15T10:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

function buildCreatives(): Creative[] {
  const out: Creative[] = [];
  let counter = 0;

  for (const client of clients) {
    // Seed from client id hash so different clients get different but stable mixes.
    const seed = [...client.id].reduce((n, c) => n + c.charCodeAt(0), 0) * 9181;
    const rand = mulberry32(seed);

    // Build full matrix of valid combos for this client.
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

    // Shuffle with seeded rand, then take first N.
    const shuffled = combos
      .map((c) => ({ c, r: rand() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.c);

    const take = client.status === "onboarding" ? 8 : 16;
    const selected = shuffled.slice(0, take);

    for (const combo of selected) {
      counter++;
      const topic = topicById[combo.topicId];
      const persona = personaById[combo.personaId];
      const copy = copyFor(combo.templateId, topic.name, persona.name, client.city);

      // Status distribution: 60% live, 15% paused, 15% draft, 10% archived.
      const roll = rand();
      const status: Creative["status"] =
        client.status === "onboarding"
          ? roll < 0.7
            ? "draft"
            : "paused"
          : roll < 0.6
            ? "live"
            : roll < 0.75
              ? "paused"
              : roll < 0.9
                ? "draft"
                : "archived";

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
        id: `cr-${counter.toString().padStart(4, "0")}`,
        clientId: client.id,
        templateId: combo.templateId,
        topicId: combo.topicId,
        personaId: combo.personaId,
        format: combo.format,
        headline: copy.headline,
        body: copy.body,
        description: copy.description,
        cta: CTAS[Math.floor(rand() * CTAS.length)],
        destinationUrl: `${client.websiteUrl}/${combo.topicId}`,
        status,
        generatedBy,
        generatedAt: generatedAtFor(rand),
        performance: perf,
        performanceBand: band,
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
