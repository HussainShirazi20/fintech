import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_CATEGORIES } from "@/lib/categories";
import { computeFeatures } from "@/lib/features";
import { fallbackInsights } from "@/lib/fallback-insights";
import {
  buildInsightsPrompt,
  containsShaming,
  sanitizeInsights,
} from "@/lib/insights-prompt";
import { chatJson, extractJson, isLlmConfigured, sampleInsights } from "@/lib/llm";
import type { Insight, Transaction } from "@/lib/types";

const TxnSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number().nonnegative(),
  type: z.enum(["credit", "debit"]),
  category: z.enum(ALL_CATEGORIES as [string, ...string[]]).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const BodySchema = z.object({
  transactions: z.array(TxnSchema).min(1).max(200),
  context: z.object({
    lifeStage: z.enum(["student", "professional", "family"]),
    incomePattern: z.enum(["regular", "irregular", "mixed"]),
    priorities: z.array(z.string()).min(1).max(3),
  }),
  useSampleCache: z.boolean().optional(),
});

/**
 * POST /api/insights — features computed in code, ONE LLM call with a
 * strict schema, one retry, rule-based fallback per failed slot.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid insights payload" }, { status: 400 });
  }
  const { transactions, context, useSampleCache } = parsed.data;
  const txns = transactions as Transaction[];
  const features = computeFeatures(txns);
  // Largest-first (spend only — Transfers excluded) — used to backfill backing txns when the model cites none.
  const topTxns = [...txns]
    .filter((t) => t.type === "debit" && t.category !== "Transfer")
    .sort((a, b) => b.amount - a.amount)
    .map((t) => ({ id: t.id, amount: t.amount }));
  const fallback = fallbackInsights(features, txns, context);

  let model = "rule-fallback";
  const llmInsights: Insight[] = [];

  const merge = (more: Insight[]) => {
    for (const ins of more) {
      if (llmInsights.length >= 3) break;
      if (!llmInsights.some((x) => x.id === ins.id)) llmInsights.push(ins);
    }
  };

  try {
    const { text, model: usedModel } = useSampleCache
      ? await sampleInsights()
      : await chatJson(buildInsightsPrompt(features, context));
    model = usedModel;
    merge(sanitizeInsights(extractJson(text), topTxns));

    if (llmInsights.length < 3 && !useSampleCache && isLlmConfigured()) {
      // one retry to fill the missing slots
      const retry = await chatJson(buildInsightsPrompt(features, context));
      model = retry.model;
      merge(sanitizeInsights(extractJson(retry.text), topTxns));
    }
  } catch {
    // fall through to per-slot fallback below
  }

  // Per-slot repair: keep valid, non-shaming LLM slots; fill gaps with fallback.
  const seen = new Set<string>();
  const final: Insight[] = [];
  for (let i = 0; i < 3; i++) {
    const cand = llmInsights[i];
    const clean =
      cand &&
      !containsShaming(`${cand.observation} ${cand.whyItMatters} ${cand.action}`) &&
      !seen.has(cand.id);
    const chosen = clean ? cand : { ...(fallback[i] ?? fallback[0]), id: `fallback-slot-${i + 1}` };
    seen.add(chosen.id);
    final.push(chosen);
  }

  return NextResponse.json({
    insights: final,
    features,
    model,
    llmConfigured: isLlmConfigured(),
  });
}
