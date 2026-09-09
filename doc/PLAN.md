# PaisaLens — Personalised Financial Behaviour Insight Prototype

> Source: `doc/PS02_FinTech_Plan.docx` | Stack: Next.js 16 + React 19 + Tailwind 4 | Deploy: Vercel

## 0. Stack decision: Next.js (not plain React)

Keep the current Next.js scaffold. The doc needs server-side API routes
(`/parse`, `/categorise`, `/insights`) to hide the LLM key, compute features
in code, and deploy as one Vercel container. Plain React would force a
second server + CORS + key-leak risk for zero hackathon benefit.

## 1. Goal

A reflection tool, not a tracker: CSV/manual transactions + declared life
context → category breakdown, spending rhythm, priority-alignment meter, and
**exactly 3 grounded, non-judgemental insight cards** with txn-level trace.
Same numbers + different context = visibly different insights (§7.4).

## 2. User flow

`Landing (Try sample / Upload) → Context (life-stage, income pattern, 2–3 priorities) → Loading (parse → categorise → reflect) → Reflection (breakdown, rhythm, recurring, alignment, 3 cards) → Card detail (backing transactions)`

## 3. Architecture

- Client: flow state machine in React + `sessionStorage` only. No DB.
  Footer + upload screen carry a plain-English privacy note.
- `POST /api/categorize`: keyword rules (~50 Indian merchants/UPI patterns)
  first → LLM fallback only for low-confidence/unknown. Strip account numbers
  before any server call. Learn from user corrections (override select).
- `POST /api/insights`: features computed **in code** → single LLM call with
  strict JSON schema (must cite real numbers + tie to a priority/life-stage +
  include a this-week micro-action; forbidden shaming phrases) → validate →
  retry once → rule-based fallback per failed slot. Cached response for the
  sample data for demo safety.
- Env: `OPENAI_API_KEY` (+ `LLM_MODEL`, `LLM_BASE_URL` so the model is swappable).

## 4. Data model (`lib/types.ts`)

- `Transaction { id, date, description, amount, type, category?, confidence? }`
- `UserContext { lifeStage: student | professional | family, income: regular | irregular | mixed, priorities: string[] }`
- `Features { categoryTotals, income, outflow, weekdayVsWeekend, startVsEndMonth, subscriptions, topExpenses, incomeRegularity }`
- `Insight { id, observation, whyItMatters, action, txnIds, amounts }`

## 5. File plan

- `app/page.tsx` (flow orchestrator), `app/layout.tsx` (title/meta only),
  `app/api/categorize/route.ts`, `app/api/insights/route.ts`
- `components/`: `LandingScreen`, `ContextForm`, `LoadingScreen`,
  `ReflectionView`, `InsightCard`, `AlignmentMeter`, `TxnTable`, `Charts`
  (CategoryBar, RhythmChart), `PrivacyNote`
- `lib/`: `types`, `categories`, `features`, `insights-prompt`,
  `fallback-insights`, `sample-data`
- `public/sample.csv` (~40 realistic synthetic Indian txns, clearly labelled)

## 6. MVP vs stretch

- MVP: CSV + manual + sample, rules + LLM categorisation, context capture,
  reflection + alignment meter, 3 cards with txn trace, privacy note.
- Stretch (only if time): what-if slider, helpful/not feedback buttons,
  `window.print` PDF. PDF statement parsing is cut per §13.

## 7. Build order (3-hour window)

1. Skeleton + sample CSV + landing (0:00–0:20)
2. Ingestion: CSV + manual + txn table (0:20–0:50)
3. Categorisation: rules + fallback (0:50–1:20)
4. Context form + session state (1:20–1:40)
5. Insights: features + prompt + fallback (1:40–2:20)
6. Reflection: charts + meter + cards (2:20–2:40)
7. Polish + Vercel + 2-context demo check (2:40–3:00)

## 8. Verify

- `npm run dev` → load sample as student vs family-earner → insights differ.
- `npm run build && npm run lint` clean.
- Every card expands to its backing txns; no raw txn persistence.

## 9. Dependencies to add

`papaparse`, `recharts`, `zod` (+ `@types/papaparse`).

## 10. Environment status (2026-09-09)

- `next@16.3.4` restored via `npm install` (was missing, `npm ls next` was empty).
- `npm run lint` clean, `npm run build` succeeds (Turbopack).
