import { z } from "zod";
import type { Features, Insight, UserContext } from "./types";

/** Strict schema for LLM output — every insight must be grounded. */
export const InsightSchema = z.object({
  id: z.string(),
  observation: z.string().min(10).max(280),
  whyItMatters: z.string().min(10).max(280),
  action: z.string().min(10).max(280),
  txnIds: z.array(z.string()).min(1).max(5),
  amounts: z.array(z.number()).min(1).max(5),
});

export const InsightsResponseSchema = z.object({
  insights: z.array(InsightSchema).length(3),
});

export function validateInsights(
  raw: unknown,
  validTxnIds: Set<string>
): Insight[] | null {
  const parsed = InsightsResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  // Every cited txn must exist — no invented numbers.
  for (const ins of parsed.data.insights) {
    if (!ins.txnIds.every((id) => validTxnIds.has(id))) return null;
  }
  return parsed.data.insights;
}

const BANNED = [
  "irresponsible",
  "shame",
  "shameful",
  "reckless",
  "stupid",
  "lazy",
  "addicted",
  "wasteful",
  "you always",
  "you never",
];

export function containsShaming(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED.some((w) => lower.includes(w));
}

export function buildInsightsPrompt(
  features: Features,
  ctx: UserContext
): string {
  const cats = features.categoryTotals
    .map((c) => `- ${c.category}: ₹${c.total.toLocaleString("en-IN")} across ${c.count} transactions`)
    .join("\n");
  const subs =
    features.subscriptions.length > 0
      ? features.subscriptions
          .map((s) => `- ${s.description}: ~₹${s.amount.toLocaleString("en-IN")} x${s.count}`)
          .join("\n")
      : "- none detected";
  const top = features.topExpenses
    .map((t) => `- [${t.id}] ${t.description} ₹${t.amount.toLocaleString("en-IN")} on ${t.date}`)
    .join("\n");

  return `You are PaisaLens, a kind, non-judgemental money-reflection companion for an Indian user. Produce EXACTLY 3 spending insights as JSON.

USER CONTEXT
- Life stage: ${ctx.lifeStage}
- Income pattern: ${ctx.incomePattern}
- Stated priorities: ${ctx.priorities.join(", ") || "not stated"}

COMPUTED FACTS (use ONLY these numbers — never invent amounts)
- Period: ${features.periodStart} to ${features.periodEnd} (${features.txnCount} transactions)
- Total income: ₹${features.income.toLocaleString("en-IN")} | Total outflow: ₹${features.outflow.toLocaleString("en-IN")} | Savings rate: ${(features.savingsRate * 100).toFixed(1)}%
- Category totals:
${cats}
- Weekday spend: ₹${features.weekdaySpend.toLocaleString("en-IN")} | Weekend spend: ₹${features.weekendSpend.toLocaleString("en-IN")}
- First-half-of-month spend: ₹${features.firstHalfSpend.toLocaleString("en-IN")} | Second-half: ₹${features.secondHalfSpend.toLocaleString("en-IN")}
- Recurring charges:
${subs}
- Largest expenses (cite by [id]):
${top}
- Income regularity: ${features.incomeRegularity}

RULES
1. Each insight MUST tie one observed pattern to the user's life-stage or a stated priority, and show HOW the same numbers would read differently for someone with different priorities.
2. "observation": one concrete pattern with at least one real number from the facts.
3. "whyItMatters": connect it to a priority or life-stage in 1-2 sentences. Warm, curious tone — never shaming, moralising, or absolute ("always"/"never").
4. "action": one tiny, specific micro-action for THIS week (under ₹500 or free, under 15 minutes).
5. "txnIds": 1-5 ids from the largest-expenses list that back the observation. "amounts": the matching rupee amounts.
6. Forbidden words: irresponsible, shame, reckless, stupid, lazy, addicted, wasteful.

Return ONLY this JSON, no markdown, no extra keys:
{"insights":[{"id":"insight-1","observation":"...","whyItMatters":"...","action":"...","txnIds":["..."],"amounts":[...]},{"id":"insight-2",...},{"id":"insight-3",...}]}`;
}
