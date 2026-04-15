import type { Campaign, AdSet } from "./types";
import { clients } from "./clients";
import { creativesByClient } from "./creatives";

type CampaignSeed = {
  clientId: string;
  platform: Campaign["platform"];
  name: string;
  status: Campaign["status"];
  objective: Campaign["objective"];
  budgetStrategy: Campaign["budgetStrategy"];
  dailyBudget: number;
  topicFilter?: string;
  adSetNames: string[];
};

const seeds: CampaignSeed[] = [
  // Bright Smile Dental
  {
    clientId: "bright-smile",
    platform: "meta",
    name: "Bright Smile — Whitening — Apr 2026",
    status: "active",
    objective: "leads",
    budgetStrategy: "cbo",
    dailyBudget: 60,
    topicFilter: "teeth-whitening",
    adSetNames: ["Feed · 25-55", "Stories & Reels · 18-40"],
  },
  {
    clientId: "bright-smile",
    platform: "meta",
    name: "Bright Smile — Invisalign — Apr 2026",
    status: "active",
    objective: "leads",
    budgetStrategy: "cbo",
    dailyBudget: 45,
    topicFilter: "invisalign",
    adSetNames: ["Feed · 22-45", "Stories · 22-40"],
  },
  {
    clientId: "bright-smile",
    platform: "google",
    name: "Bright Smile — Search — Local",
    status: "active",
    objective: "leads",
    budgetStrategy: "adset",
    dailyBudget: 25,
    adSetNames: ["Brand + Local"],
  },
  // Mayfair Dental Studio
  {
    clientId: "mayfair-dental",
    platform: "meta",
    name: "Mayfair — Veneers — Q2",
    status: "active",
    objective: "leads",
    budgetStrategy: "cbo",
    dailyBudget: 120,
    topicFilter: "veneers",
    adSetNames: ["Feed · Premium 30-55", "Reels · 25-45"],
  },
  {
    clientId: "mayfair-dental",
    platform: "meta",
    name: "Mayfair — Implants — Q2",
    status: "active",
    objective: "leads",
    budgetStrategy: "cbo",
    dailyBudget: 90,
    topicFilter: "implants",
    adSetNames: ["Feed · 40-65"],
  },
  {
    clientId: "mayfair-dental",
    platform: "google",
    name: "Mayfair — Search — Cosmetic",
    status: "active",
    objective: "leads",
    budgetStrategy: "adset",
    dailyBudget: 60,
    adSetNames: ["Cosmetic · Central London"],
  },
  {
    clientId: "mayfair-dental",
    platform: "meta",
    name: "Mayfair — Whitening — Paused",
    status: "paused",
    objective: "traffic",
    budgetStrategy: "adset",
    dailyBudget: 25,
    topicFilter: "teeth-whitening",
    adSetNames: ["Feed · 25-45"],
  },
  // Northside Family Dentistry
  {
    clientId: "northside-family",
    platform: "meta",
    name: "Northside — Children's Checkups — Apr",
    status: "active",
    objective: "leads",
    budgetStrategy: "adset",
    dailyBudget: 30,
    topicFilter: "children",
    adSetNames: ["Feed · Parents 28-45"],
  },
  {
    clientId: "northside-family",
    platform: "meta",
    name: "Northside — Emergency — Always On",
    status: "active",
    objective: "leads",
    budgetStrategy: "adset",
    dailyBudget: 22,
    topicFilter: "emergency",
    adSetNames: ["Feed + Search · 20-65"],
  },
  {
    clientId: "northside-family",
    platform: "google",
    name: "Northside — Search — Emergency",
    status: "active",
    objective: "leads",
    budgetStrategy: "adset",
    dailyBudget: 18,
    adSetNames: ["Emergency Search · North Manchester"],
  },
  // Riverside Orthodontics (onboarding)
  {
    clientId: "riverside-ortho",
    platform: "meta",
    name: "Riverside — Invisalign Launch",
    status: "draft",
    objective: "leads",
    budgetStrategy: "cbo",
    dailyBudget: 40,
    topicFilter: "invisalign",
    adSetNames: ["Feed · 22-45", "Stories · 18-35"],
  },
];

let adSetCounter = 1;

function buildCampaigns(): Campaign[] {
  return seeds.map((seed, i) => {
    const clientCreatives = creativesByClient[seed.clientId] ?? [];
    const poolByTopic = seed.topicFilter
      ? clientCreatives.filter((c) => c.topicId === seed.topicFilter)
      : clientCreatives;
    const pool = poolByTopic.length ? poolByTopic : clientCreatives;

    const id = `cmp-${(i + 1).toString().padStart(3, "0")}`;
    const perCampaignSeed = [...id].reduce((n, c) => n + c.charCodeAt(0), 0);
    const adSets: AdSet[] = seed.adSetNames.map((name, j) => {
      const placements: AdSet["placements"] = /Stor|Reel/.test(name)
        ? "stories-reels"
        : /Feed \+ Search/.test(name) || /Search/.test(name)
          ? "both"
          : "feed";
      const creativesForSet = pool
        .filter((c) => {
          if (placements === "stories-reels") return c.format === "story";
          if (placements === "feed") return c.format === "feed";
          return true;
        })
        .slice(j * 4, j * 4 + 4)
        .map((c) => c.id);

      return {
        id: `as-${(adSetCounter++).toString().padStart(3, "0")}`,
        campaignId: id,
        name,
        dailyBudget: seed.budgetStrategy === "cbo" ? 0 : Math.floor(seed.dailyBudget / seed.adSetNames.length),
        status: seed.status === "paused" ? "paused" : "active",
        placements,
        audienceType: "advantage-plus",
        ageMin: 22,
        ageMax: 65,
        creativeIds: creativesForSet.length ? creativesForSet : pool.slice(0, 2).map((c) => c.id),
      };
    });

    // Aggregate performance across linked creatives, when available.
    const linkedCreatives = pool.filter((c) =>
      adSets.some((s) => s.creativeIds.includes(c.id)),
    );
    const perfs = linkedCreatives
      .map((c) => c.performance)
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    const spend7d = perfs.reduce((s, p) => s + p.spend, 0);
    const leads7d = perfs.reduce((s, p) => s + p.leads, 0);
    const cpl = leads7d > 0 ? Math.round((spend7d / leads7d) * 100) / 100 : 0;
    const clicks = perfs.reduce((s, p) => s + p.clicks, 0);
    const impressions = perfs.reduce((s, p) => s + p.impressions, 0);
    const ctr =
      impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;

    const updatedAt = new Date(
      Date.UTC(2026, 3, 14 - (perCampaignSeed % 6), 9 + (i % 8)),
    ).toISOString();

    return {
      id,
      clientId: seed.clientId,
      platform: seed.platform,
      name: seed.name,
      status: seed.status,
      objective: seed.objective,
      budgetStrategy: seed.budgetStrategy,
      dailyBudget: seed.dailyBudget,
      spend7d: Math.round(spend7d * 100) / 100,
      leads7d,
      cpl,
      ctr,
      updatedAt,
      adSets,
    };
  });
}

export const campaigns: Campaign[] = buildCampaigns();

// Backfill creative.campaignIds now that campaigns exist — walks every
// campaign's ad sets and appends the parent campaign id to each linked
// creative. This is how the creative↔campaign many-to-many is discovered.
for (const campaign of campaigns) {
  for (const adSet of campaign.adSets) {
    for (const creativeId of adSet.creativeIds) {
      const c = creativesByClient[campaign.clientId]?.find(
        (cr) => cr.id === creativeId,
      );
      if (c && !c.campaignIds.includes(campaign.id)) {
        c.campaignIds.push(campaign.id);
      }
    }
  }
}

export const campaignsByClient: Record<string, Campaign[]> = clients.reduce(
  (acc, c) => {
    acc[c.id] = campaigns.filter((cmp) => cmp.clientId === c.id);
    return acc;
  },
  {} as Record<string, Campaign[]>,
);

export const campaignById = Object.fromEntries(
  campaigns.map((c) => [c.id, c]),
);

export const creativesByCampaign: Record<string, string[]> = campaigns.reduce(
  (acc, c) => {
    const ids = new Set<string>();
    for (const s of c.adSets) for (const cid of s.creativeIds) ids.add(cid);
    acc[c.id] = Array.from(ids);
    return acc;
  },
  {} as Record<string, string[]>,
);
