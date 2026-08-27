# ScriptCraft

ScriptCraft is a Bootstrap-powered SaaS workspace for generating AI video scripts for TikTok, YouTube Shorts, Instagram Reels, X, and LinkedIn.

## What Changed

- Tailwind-based MVP replaced by a Bootstrap-first responsive layout
- Gemini REST integration for structured script generation
- Stripe REST checkout, billing confirmation, status, and portal routes
- Local workspace profile, script history, export flow, and business-team staging
- Domain-ready metadata and security-oriented Next.js headers

## Environment

Copy `.env.example` and set:

- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_BUSINESS_PRICE_ID`

If `GEMINI_API_KEY` is missing, the app falls back to a deterministic studio generator so the UI still works. If Stripe keys are missing, checkout and portal actions return configuration errors.

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Billing Flow

1. User starts hosted Stripe checkout from the workspace.
2. Stripe redirects back with `session_id`.
3. `/api/billing/confirm` verifies the subscription and stores a signed billing session cookie.
4. `/api/generate` enforces the free 5-script monthly limit unless an active paid subscription is present.

## Export Flow

- Copy full script to clipboard
- Export plain text
- Export formatted HTML
- Print to PDF from the browser

## Deployment Notes

- Intended domain: `scriptcraft.boone51.com`
- Do not deploy directly from this handoff
- Required deployment chain: Codex → Alice → Neo → Production
