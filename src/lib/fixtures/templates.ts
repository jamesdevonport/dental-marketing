import type { Template } from "./types";

export const templates: Template[] = [
  {
    id: "event-promo",
    name: "Event Promo",
    description:
      "Bold headline on a coloured background. Used for limited-time offers, open days, launches.",
    supportedFormats: ["feed", "story", "link"],
  },
  {
    id: "testimonial",
    name: "Testimonial",
    description:
      "Quote card with patient name, photo and star rating. Highest-trust template.",
    supportedFormats: ["feed", "story", "link"],
  },
  {
    id: "community",
    name: "Community",
    description:
      "Photo grid of real patients or team. Warm, local, approachable.",
    supportedFormats: ["feed", "story"],
  },
  {
    id: "comparison",
    name: "Before / After",
    description:
      "Split-panel comparison. Works best for cosmetic treatments with visible outcomes.",
    supportedFormats: ["feed", "link"],
  },
  {
    id: "apple-notes",
    name: "Apple Notes",
    description:
      "Mock iOS Notes checklist. Native-feeling. Great for explanation and objection-handling.",
    supportedFormats: ["feed", "story"],
  },
  {
    id: "imessage",
    name: "iMessage",
    description:
      "Mock iOS conversation. Native-feeling. Best for Q&A-style copy and social proof.",
    supportedFormats: ["feed", "story"],
  },
];

export const templateById = Object.fromEntries(templates.map((t) => [t.id, t]));
