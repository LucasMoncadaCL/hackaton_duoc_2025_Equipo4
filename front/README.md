# CardioSense Frontend

Frontend for the cardiometabolic risk coach described in `ml/`. It uses **Next.js 15 (App Router)** with **Tailwind CSS v4** and is deployed on **Cloudflare Workers via OpenNext**. This layer collects user health data, calls the FastAPI endpoints (`/predict`, `/coach`) produced by the ML team, and renders risk insights with clear medical disclaimers.

## Product Scope
- Capture baseline NHANES-style inputs: age (`RIDAGEYR`), sex (`RIAGENDR` → `male`/`female`), weight (`BMXWT` kg), height (`BMXHT` cm), waist (`BMXWAIST` cm), systolic/diastolic BP, lifestyle flags (smoking, sleep, activity). Align naming/units with the ML templates in `ml/guia.md` to avoid feature drift.
- Send the normalized payload to the backend `/predict` endpoint. Expect a response containing at least `{ score, risk_bucket, calibration, fairness? }`. Show AUROC target (≥0.80) and guard against missing metrics.
- After scoring, call `/coach` with `{ profile, score }` to obtain a two-week plan sourced from the RAG knowledge base in `ml/kb`. Render sources `[archivo.md]` exactly as returned and keep the medical disclaimer visible.
- Surface fairness insights when the backend supplies them (subgroup deltas, model thresholds). Degrade gracefully if absent.
- Persist the most recent submission locally (e.g., `localStorage`) to support iterative coaching without storing PII remotely.

## Architecture Touchpoints
1. **UI Layer (`src/app/…`)** – multi-step flow: intake form → risk result → coaching tab. Guard against partial submissions and provide inline validation per unit (age 18–85, waist 40–200 cm, etc.).
2. **API Client (`src/lib/api.ts` planned)** – thin wrapper around `fetch` that injects `NEXT_PUBLIC_API_BASE_URL` and handles retries/timeouts.
3. **State Management** – start with React hooks/server actions; introduce a client store (e.g., Zustand) only if multi-page state becomes complex.
4. **Deployment** – `npm run preview` builds with OpenNext and serves on Cloudflare Workers. Use Wrangler secrets for backend URLs in production.

## Directory Layout (current)
```
front/
├── src/app/
│   ├── layout.tsx        # App shell + font setup
│   ├── globals.css       # Tailwind theme tokens
│   └── page.tsx          # Placeholder landing (replace with intake flow)
├── public/               # Static assets (SVG icons, favicon)
├── open-next.config.ts   # Cloudflare bindings config stub
├── wrangler.jsonc        # Worker deployment configuration
├── cloudflare-env.d.ts   # Type definitions for CF bindings
└── package.json          # Scripts & dependencies (Next 15, React 19)
```

## Environment & Secrets
Create `.env.local` for local development (see `.env.local.example`):

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_FEATURE_FLAGS=baseline
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For Cloudflare, mirror the same values with `wrangler secret put`. Never commit `.env*` files.

## NPM Scripts
- `npm run dev` – Next dev server (Turbopack) with Cloudflare compat.
- `npm run lint` – ESLint (extends `next/core-web-vitals`).
- `npm run build` – Production build (Next.js).
- `npm run preview` – Build + preview via OpenNext on Cloudflare Workers.
- `npm run deploy` – Build and deploy to Cloudflare Workers.
- `npm run cf-typegen` – Refresh `cloudflare-env.d.ts` after binding changes.

## Working Agreements for AI Agents
- Follow the data-handling guardrails documented in `ml/guia.md` (no lab-derived labels, consistent units).
- Maintain explicit consent & medical disclaimer on every screen (`Este sistema no reemplaza un diagnóstico médico`).
- Reuse Tailwind tokens defined in `globals.css`; avoid ad-hoc colors or fonts.
- Keep HTTP interfaces in sync with the FastAPI reference implementation in `ml/` and coordinate schema changes via shared TypeScript types (`src/types/generated.d.ts` placeholder).
- Document UX or contract changes in `front/RESUMEN_REPOSITORIO.md` so Cursor/Copilot stay aligned.

Additional guides:
- `front/QUICK_START.md` – setup checklist for contributors.
- `front/RESUMEN_REPOSITORIO.md` – status snapshot + key files.
- `front/guia.md` – detailed flow rules for form, scoring, and coaching views.

---

**Disclaimer:** CardioSense es una herramienta educativa; no entrega diagnósticos médicos. Siempre referir al usuario a profesionales de salud.
