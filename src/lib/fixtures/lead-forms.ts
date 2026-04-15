import type { LeadForm } from "./types";

export const leadForms: LeadForm[] = [
  {
    id: "lf-brightsmile-whitening",
    clientId: "bright-smile",
    name: "Whitening Enquiry",
    fields: ["full_name", "email", "phone", "preferred_time"],
    thankYouMessage:
      "Thanks — we'll call you within one business day to book your free whitening consultation.",
    status: "published",
    createdAt: "2025-12-02T10:15:00Z",
  },
  {
    id: "lf-mayfair-veneers",
    clientId: "mayfair-dental",
    name: "Veneers Assessment",
    fields: [
      "full_name",
      "email",
      "phone",
      "preferred_time",
      "service_interest",
    ],
    thankYouMessage:
      "Thank you. A member of our cosmetic team will be in touch within 24 hours to arrange your assessment.",
    status: "published",
    createdAt: "2025-10-14T09:00:00Z",
  },
  {
    id: "lf-mayfair-invisalign",
    clientId: "mayfair-dental",
    name: "Invisalign Consultation",
    fields: ["full_name", "email", "phone", "preferred_time"],
    thankYouMessage:
      "Your Invisalign consultation request has been received. We'll reach out shortly.",
    status: "published",
    createdAt: "2025-11-03T14:22:00Z",
  },
  {
    id: "lf-northside-emergency",
    clientId: "northside-family",
    name: "Emergency Callback",
    fields: ["full_name", "phone"],
    thankYouMessage:
      "We've got your details. Our emergency line will call you back within 15 minutes.",
    status: "published",
    createdAt: "2026-01-28T11:45:00Z",
  },
  {
    id: "lf-northside-new-patient",
    clientId: "northside-family",
    name: "New Patient Registration",
    fields: [
      "full_name",
      "email",
      "phone",
      "preferred_time",
      "service_interest",
    ],
    thankYouMessage:
      "Welcome to Northside. We'll call you to book your first appointment.",
    status: "published",
    createdAt: "2026-02-10T13:00:00Z",
  },
  {
    id: "lf-riverside-invisalign",
    clientId: "riverside-ortho",
    name: "Invisalign Consultation",
    fields: ["full_name", "email", "phone", "preferred_time"],
    thankYouMessage:
      "Thanks. Dr Rinaldi's team will confirm your consultation slot by email.",
    status: "published",
    createdAt: "2026-04-03T09:30:00Z",
  },
  {
    id: "lf-riverside-braces",
    clientId: "riverside-ortho",
    name: "Braces Enquiry",
    fields: ["full_name", "email", "phone", "service_interest"],
    thankYouMessage:
      "Thanks for your interest. We'll share pricing and options within one business day.",
    status: "draft",
    createdAt: "2026-04-05T10:00:00Z",
  },
];

export const leadFormById = Object.fromEntries(
  leadForms.map((f) => [f.id, f]),
);

export const leadFormsByClient: Record<string, LeadForm[]> = leadForms.reduce(
  (acc, f) => {
    (acc[f.clientId] ??= []).push(f);
    return acc;
  },
  {} as Record<string, LeadForm[]>,
);
