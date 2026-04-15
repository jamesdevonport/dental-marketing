import type { Persona } from "./types";

export const personas: Persona[] = [
  {
    id: "anxious",
    name: "Anxious Patient",
    description:
      "Hasn't seen a dentist in years. Nervous. Needs reassurance and a soft landing.",
    concerns: ["Pain", "Judgement", "Cost surprises", "Loss of control"],
    toneAdjustments:
      "Warm, slow, reassuring. Avoid clinical language. Use 'we' instead of 'I'.",
  },
  {
    id: "cost-conscious-family",
    name: "Cost-Conscious Family",
    description:
      "Parents weighing NHS vs private options. Budget-sensitive. Want value over luxury.",
    concerns: ["Overall bill", "Hidden fees", "Multiple kids", "NHS availability"],
    toneAdjustments:
      "Plain-spoken, practical. Lead with price transparency and payment plans.",
  },
  {
    id: "cosmetic-professional",
    name: "Cosmetic-Focused Professional",
    description:
      "Mid-career professional investing in their smile. Discreet, image-aware.",
    concerns: ["Recovery time", "Subtlety", "Quality of finish", "Before/after proof"],
    toneAdjustments:
      "Polished, outcome-focused. Emphasise results and discretion. Photo evidence.",
  },
  {
    id: "busy-parent",
    name: "Busy Parent",
    description:
      "Juggling work and kids. Wants efficient, convenient treatment with out-of-hours options.",
    concerns: ["Time off work", "Scheduling", "One-and-done visits", "Kid-friendly"],
    toneAdjustments:
      "Direct. Lead with convenience, late openings, Saturday slots.",
  },
  {
    id: "young-professional",
    name: "Young Professional",
    description:
      "Recently moved to the area. No current dentist. Researches online before booking.",
    concerns: ["Reviews", "Online booking", "Quick access", "Insurance"],
    toneAdjustments:
      "Modern, confident. Social proof and digital-first cues land best.",
  },
  {
    id: "near-emergency",
    name: "Near-Emergency Seeker",
    description:
      "In pain right now or after a visible break. Looking for someone who can see them today.",
    concerns: ["Pain relief", "Availability today", "Cost", "Reassurance"],
    toneAdjustments:
      "Urgent, calm, specific. Phone number prominent. Same-day promise.",
  },
  {
    id: "nervous-first-timer",
    name: "Nervous First-Timer",
    description:
      "Adult patient who has avoided the dentist due to anxiety or bad past experience.",
    concerns: ["Shame", "Pain", "Judgement", "What to expect"],
    toneAdjustments:
      "Patient, kind, detailed. Walk through what a first visit looks like.",
  },
  {
    id: "high-income-cosmetic",
    name: "High-Income Cosmetic Shopper",
    description:
      "Premium buyer. Comparing clinics on reputation, technology, and before/afters.",
    concerns: ["Brand quality", "Surgeon credentials", "Before/after", "Financing"],
    toneAdjustments:
      "Premium, understated, confident. Craft and credentials. No discount language.",
  },
];

export const personaById = Object.fromEntries(personas.map((p) => [p.id, p]));
