# Dental Marketing

AI-powered ad campaign system for dental marketing agencies. Currently a **clickable wireframe** — UI iteration phase, no backend logic yet.

## Source of truth

UI spec: `../ui-plan-dental-ads-portal.md` (outside this repo)

## Stack

- Next.js 16 · App Router · TypeScript
- Tailwind v4 · shadcn/ui (base-nova preset, Base UI primitives)
- Lucide icons · Recharts
- `@opennextjs/cloudflare` → Cloudflare Workers Builds (GitHub-driven deploy)

## Local dev

```bash
npm install
npm run dev       # http://localhost:3000
```

Fixture data lives in `src/lib/fixtures/`. No backend, no auth — navigation is the wireframe.

## Local Cloudflare preview (optional)

```bash
npm run cf:preview   # builds with OpenNext, runs wrangler dev
```

## Deploy

Push to `main`. Cloudflare Workers Builds should run a single deploy command that builds and deploys in one step.

First-time setup (one-off, in the Cloudflare dashboard):

1. Workers & Pages → Create → **Connect to Git** → GitHub → select `dental-marketing`
2. Build configuration:
   - Build command: leave blank
   - Deploy command: `npm run deploy`
3. Save & deploy.

Why this matters:

- `npx wrangler deploy` expects the OpenNext output to already exist in `.open-next/`
- if Workers Builds skips or misconfigures the separate build step, deploy fails with `Could not find compiled Open Next config`
- `npm run deploy` avoids that failure mode because it runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`

From then on, every push to `main` deploys. Preview deploys are created for PRs.

## Structure

```
src/
  app/
    (agency)/       Agency workspace — sidebar + top bar shell
    (client)/       Dental practice portal (read-only)
    (auth)/         Login / signup / OAuth callbacks
  components/
    ui/             shadcn components
    layout/         Sidebar, top bar, breadcrumbs, client switcher
    creative/       Procedural creative thumbnail (no imagery deps)
    common/         Cross-cutting bits (delta chip, urgency pill, sparkline)
  lib/
    fixtures/       Hardcoded tenant + clients + creatives + agent proposals
    format.ts       Currency / percent / relative-time helpers
    utils.ts        cn() merge helper
```

## Design notes

- Neutral slate + indigo accent. One-file rebrand via `src/app/globals.css`.
- Per-client brand kits ARE expected to look different — shown in fixtures.
- No CW Marketing assets — this is a different domain.
- All creative thumbnails are procedural, not imported imagery.
