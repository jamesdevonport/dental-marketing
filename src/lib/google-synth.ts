import type { Campaign } from "@/lib/fixtures";
import { clientById } from "@/lib/fixtures";

export type MatchType = "broad" | "phrase" | "exact";

export type Keyword = {
  id: string;
  keyword: string;
  matchType: MatchType;
  status: "active" | "paused";
  impressions: number;
  clicks: number;
  ctr: number; // percent
  avgCpc: number; // £
  conversions: number;
  conversionRate: number; // percent
  cost: number;
  cpl: number;
  qualityScore: number; // 1-10
};

export type SearchTermStatus = "added" | "not_added" | "wasteful";

export type SearchTerm = {
  id: string;
  query: string;
  matchedKeyword?: string;
  matchType?: MatchType;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost: number;
  status: SearchTermStatus;
};

// Deterministic PRNG (matches the one in fixtures/creatives.ts)
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

const TOPIC_MAP: { match: RegExp; topic: string }[] = [
  { match: /whitening/i, topic: "teeth whitening" },
  { match: /invisalign/i, topic: "invisalign" },
  { match: /veneers/i, topic: "veneers" },
  { match: /implants/i, topic: "dental implants" },
  { match: /emergency/i, topic: "emergency dentist" },
  { match: /children|kids/i, topic: "children's dentist" },
  { match: /cosmetic/i, topic: "cosmetic dentist" },
  { match: /braces/i, topic: "braces" },
  { match: /checkup|hygiene/i, topic: "dental checkup" },
];

function topicSeedFor(campaign: Campaign): string {
  for (const { match, topic } of TOPIC_MAP) {
    if (match.test(campaign.name)) return topic;
  }
  return "dentist";
}

function citySeedFor(campaign: Campaign): string {
  return clientById[campaign.clientId]?.city ?? "London";
}

function practiceSlugFor(campaign: Campaign): string {
  const client = clientById[campaign.clientId];
  if (!client) return "practice";
  return client.name
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");
}

function seedNumber(input: string): number {
  return [...input].reduce((n, c) => n + c.charCodeAt(0), 0);
}

// ---------------------------------------------------------------------------
// Keywords
// ---------------------------------------------------------------------------

const KW_MATCH_BIAS: Record<MatchType, number> = {
  exact: 2.5,
  phrase: 1,
  broad: 0,
};

export function keywordsFor(campaign: Campaign): Keyword[] {
  const seed = seedNumber(campaign.id) * 7919;
  const topic = topicSeedFor(campaign);
  const city = citySeedFor(campaign);
  const practice = practiceSlugFor(campaign);

  const patterns: { keyword: string; matchType: MatchType }[] = [
    { keyword: `${topic} ${city.toLowerCase()}`, matchType: "broad" },
    { keyword: `${topic} near me`, matchType: "phrase" },
    { keyword: `${topic} cost ${city.toLowerCase()}`, matchType: "exact" },
    { keyword: `${topic} cost`, matchType: "broad" },
    { keyword: `best ${topic}`, matchType: "broad" },
    { keyword: `${topic} prices`, matchType: "phrase" },
    { keyword: practice, matchType: "exact" },
    { keyword: `${city.toLowerCase()} ${topic} reviews`, matchType: "broad" },
    { keyword: `book ${topic} ${city.toLowerCase()}`, matchType: "phrase" },
    { keyword: `${topic} consultation`, matchType: "phrase" },
  ];

  return patterns.map((p, i) => {
    const r = mulberry32(seed + i * 31);
    const impressions = Math.floor(400 + r() * 4500);
    const ctr = 1.4 + r() * 5;
    const clicks = Math.max(1, Math.floor((impressions * ctr) / 100));
    const avgCpc = 0.6 + r() * 3.2;
    const cost = Math.round(clicks * avgCpc * 100) / 100;
    const convRate = 4 + r() * 12;
    const conversions = Math.max(0, Math.floor((clicks * convRate) / 100));
    const cpl = conversions > 0 ? cost / conversions : cost;

    // Quality Score: longer / exact-match / brand-name keywords tend to score higher
    const lengthBias = Math.min(3, p.keyword.length / 12);
    const matchBias = KW_MATCH_BIAS[p.matchType];
    const qualityRaw = 4 + lengthBias + matchBias + r() * 2;
    const qualityScore = Math.min(10, Math.max(1, Math.round(qualityRaw)));

    return {
      id: `kw-${campaign.id}-${i}`,
      keyword: p.keyword,
      matchType: p.matchType,
      status: r() < 0.85 ? "active" : "paused",
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      avgCpc: Math.round(avgCpc * 100) / 100,
      conversions,
      conversionRate: Math.round(convRate * 10) / 10,
      cost,
      cpl: Math.round(cpl * 100) / 100,
      qualityScore,
    };
  });
}

// ---------------------------------------------------------------------------
// Search terms
// ---------------------------------------------------------------------------

export function searchTermsFor(campaign: Campaign): SearchTerm[] {
  const seed = seedNumber(campaign.id) * 11939;
  const topic = topicSeedFor(campaign);
  const city = citySeedFor(campaign).toLowerCase();
  const practice = practiceSlugFor(campaign);
  const wastefulModifier = topic.includes("emergency") ? "free " : "diy ";

  const patterns: {
    query: string;
    status: SearchTermStatus;
    matchedKeyword?: string;
    matchType?: MatchType;
  }[] = [
    { query: `${topic} near me`, status: "added", matchedKeyword: `${topic} near me`, matchType: "phrase" },
    { query: `${topic} ${city}`, status: "added", matchedKeyword: `${topic} ${city}`, matchType: "broad" },
    { query: `cheap ${topic}`, status: "not_added", matchedKeyword: `${topic} cost`, matchType: "broad" },
    { query: `${topic} cost ${city}`, status: "not_added", matchedKeyword: `${topic} ${city}`, matchType: "broad" },
    { query: `book ${topic} appointment`, status: "added", matchedKeyword: `book ${topic} ${city}`, matchType: "phrase" },
    { query: `${topic} reviews ${city}`, status: "added", matchedKeyword: `${city} ${topic} reviews`, matchType: "broad" },
    { query: `nhs ${topic}`, status: "wasteful", matchedKeyword: topic, matchType: "broad" },
    { query: `how much is ${topic}`, status: "not_added", matchedKeyword: `${topic} cost`, matchType: "broad" },
    { query: `${topic} private`, status: "added", matchedKeyword: `best ${topic}`, matchType: "broad" },
    { query: `${wastefulModifier}${topic}`, status: "wasteful", matchedKeyword: topic, matchType: "broad" },
    { query: `${topic} pain relief`, status: "wasteful", matchedKeyword: topic, matchType: "broad" },
    { query: `is ${topic} worth it`, status: "not_added", matchedKeyword: `best ${topic}`, matchType: "broad" },
    { query: `best ${topic} ${city}`, status: "added", matchedKeyword: `best ${topic}`, matchType: "broad" },
    { query: `${topic} with finance`, status: "not_added", matchedKeyword: `${topic} cost`, matchType: "broad" },
    { query: `${topic} 0 finance`, status: "not_added", matchedKeyword: `${topic} cost`, matchType: "broad" },
    { query: `same day ${topic}`, status: "added", matchedKeyword: `book ${topic} ${city}`, matchType: "phrase" },
    { query: `${practice} ${city}`, status: "added", matchedKeyword: practice, matchType: "exact" },
  ];

  return patterns.map((p, i) => {
    const r = mulberry32(seed + i * 17);
    const isWasteful = p.status === "wasteful";
    const impressions = Math.floor(80 + r() * (isWasteful ? 500 : 1800));
    const ctr = isWasteful ? 0.3 + r() * 1.5 : 1.8 + r() * 5;
    const clicks = Math.max(1, Math.floor((impressions * ctr) / 100));
    const avgCpc = 0.6 + r() * 3.2;
    const cost = Math.round(clicks * avgCpc * 100) / 100;
    const convRate = isWasteful ? 0.5 + r() * 2 : 5 + r() * 14;
    const conversions = Math.max(0, Math.floor((clicks * convRate) / 100));

    return {
      id: `st-${campaign.id}-${i}`,
      query: p.query,
      matchedKeyword: p.matchedKeyword,
      matchType: p.matchType,
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      conversions,
      cost,
      status: p.status,
    };
  });
}
