import type { Topic } from "./types";

export const topics: Topic[] = [
  {
    id: "teeth-whitening",
    name: "Teeth Whitening",
    description:
      "In-chair and take-home whitening treatments for patients wanting a brighter smile.",
    priceRange: "mid",
  },
  {
    id: "invisalign",
    name: "Invisalign / Clear Aligners",
    description:
      "Clear aligner orthodontics — discreet teeth-straightening over 6–18 months.",
    priceRange: "premium",
  },
  {
    id: "implants",
    name: "Dental Implants",
    description:
      "Titanium implants to replace missing teeth, including single, multi and full-arch cases.",
    priceRange: "premium",
  },
  {
    id: "emergency",
    name: "Emergency Dental",
    description:
      "Same-day or next-day appointments for pain, trauma, broken teeth and lost fillings.",
    priceRange: "mid",
  },
  {
    id: "checkups",
    name: "Check-ups & Hygiene",
    description:
      "Routine examinations and scale-and-polish hygiene appointments — the bread and butter.",
    priceRange: "budget",
  },
  {
    id: "veneers",
    name: "Cosmetic Veneers",
    description:
      "Porcelain or composite veneers — transformative cosmetic work for front teeth.",
    priceRange: "premium",
  },
  {
    id: "bonding",
    name: "Composite Bonding",
    description:
      "Same-day cosmetic reshaping using tooth-coloured composite resin.",
    priceRange: "mid",
  },
  {
    id: "children",
    name: "Children's Dentistry",
    description:
      "Check-ups and preventive care for paediatric patients — NHS and private.",
    priceRange: "budget",
  },
  {
    id: "dentures",
    name: "Dentures",
    description:
      "Full and partial dentures, including modern flexible and implant-retained options.",
    priceRange: "mid",
  },
  {
    id: "root-canal",
    name: "Root Canal",
    description:
      "Endodontic treatment to save teeth from extraction when the nerve is compromised.",
    priceRange: "mid",
  },
];

export const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
