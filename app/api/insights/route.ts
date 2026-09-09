import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_CATEGORIES } from "@/lib/categories";
import { computeFeatures } from "@/lib/features";
import { fallbackInsights } from "@/lib/fallback-insights";
import {
  buildInsightsPrompt,
  containsShaming,
  validateInsights,
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
  const validIds = new Set(txns.map((t) => t.id));
  const fallback = fallbackInsights(features, txns, context);

  let model = "rule-fallback";
  let llmInsights: Insight[] | null = null;

  try {
    const { text, model: usedModel } = useSampleCache
      ? await sampleInsights()
      : await chatJson(buildInsightsPrompt(features, context));
    model = usedModel;
    llmInsights = validateInsights(extractJson(text), validIds);

    if (!llmInsights && !useSampleCache && isLlmConfigured()) {
      // one retry
      const retry = await chatJson(buildInsightsPrompt(features, context));
      model = retry.model;
      llmInsights = validateInsights(extractJson(retry.text), validIds);
    } else if (!llmInsights && useSampleCache) {
      llmInsights = validateInsights(extractJson(text), validIds);
    }
  } catch {
    llmInsights = null;
  }

  // Per-slot repair: keep valid, non-shaming LLM slots; fill gaps with fallback.
  const seen = new Set<string>();
  const final: Insight[] = [];
  for (let i = 0; i < 3; i++) {
    const cand = llmInsights?.[i];
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
