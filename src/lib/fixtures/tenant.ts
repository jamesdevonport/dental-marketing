import type { Tenant, TeamMember } from "./types";

export const tenant: Tenant = {
  id: "molar-marketing",
  name: "Molar Marketing",
  plan: "Agency · Growth",
  creditsUsed: 1284,
  creditsLimit: 2500,
};

export const team: TeamMember[] = [
  {
    id: "u-1",
    name: "James Devonport",
    email: "james@molarmarketing.co.uk",
    role: "owner",
    avatarInitials: "JD",
  },
  {
    id: "u-2",
    name: "Priya Shah",
    email: "priya@molarmarketing.co.uk",
    role: "admin",
    avatarInitials: "PS",
  },
  {
    id: "u-3",
    name: "Tom Ellis",
    email: "tom@molarmarketing.co.uk",
    role: "editor",
    avatarInitials: "TE",
  },
  {
    id: "u-4",
    name: "Rachel O'Connor",
    email: "rachel@molarmarketing.co.uk",
    role: "editor",
    avatarInitials: "RO",
  },
  {
    id: "u-5",
    name: "Sam Ng",
    email: "sam@molarmarketing.co.uk",
    role: "viewer",
    avatarInitials: "SN",
  },
];
